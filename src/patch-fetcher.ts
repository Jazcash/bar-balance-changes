import { Octokit } from "@octokit/rest";
import { diff, addedDiff, deletedDiff, updatedDiff, detailedDiff } from 'deep-object-diff';
import * as luaparse from "luaparse";
import { Expression, ReturnStatement, Statement, StringLiteral, TableConstructorExpression, TableKeyString } from "luaparse";
import { ChangeType, ObjectChanges, PreparedUnitDefProperty, PrimitiveValue, UnitDefObject, UnitDefValueType, ValueChange } from "./types";
import { unitDefProps } from "./unitdef-props";

export interface PatchFetcherConfig {
    owner: string;
    repo: string;
    branch?: string;
    auth?: string;
}

export class PatchFetcher {
    public config: PatchFetcherConfig;

    protected octokit: Octokit;
    protected unitNames: { [key: string]: string; } = {};

    constructor(config: PatchFetcherConfig) {
        this.config = config;

        this.octokit = new Octokit({
            auth: this.config.auth
        });
    }

    public async fetchLatestBalancePatches(since?: Date) : Promise<ObjectChanges[]> {
        // const commits = await this.octokit.rest.repos.listCommits({ 
        //     owner: this.config.owner,
        //     repo: this.config.repo,
        //     sha: this.config.branch,
        //     path: "units",
        //     since: since?.toISOString()
        // });
    
        this.unitNames = await this.fetchUnitNames();

        const commitChanges = this.parseCommit("d7bdef7298c7e2d915239e601781b3518ea7351c");
        
        return commitChanges;
    }

    public async fetchUnitNames() : Promise<{ [key: string]: string; }> {
        const unitsEn = await this.octokit.rest.repos.getContent({
            owner: this.config.owner,
            repo: this.config.repo,
            path: "language/units_en.lua",
            mediaType: {
                format: "raw"
            }
        });

        return this.parseUnitNames(unitsEn.data.toString());
    }

    protected parseCommits() {
        
    }

    protected async parseCommit(commitSha: string) : Promise<ObjectChanges[]> {
        const fullCommit = await this.octokit.rest.repos.getCommit({
            owner: this.config.owner,
            repo: this.config.repo,
            ref: commitSha
        });

        const parentSHA = fullCommit.data.parents[0].sha;

        const files = fullCommit.data.files ?? [];
        const changedFiles: string[] = [];
        for (const file of files) {
            if (file.filename && file.filename.match(/^units\/.*?\.lua$/)) {
                if (file.status === "modified") {
                    changedFiles.push(file.filename);
                } else if (file.status === "added") {
                    console.log(file);
                } else if (file.status === "removed") {

                }
            }
        }

        const unitChanges: ObjectChanges[] = [];

        for (const file of changedFiles) {
            const previousUnitDef = await this.getUnitDef(file, parentSHA);
            const currentUnitDef = await this.getUnitDef(file, commitSha);

            const unitDefDiff = diff(previousUnitDef, currentUnitDef);

            console.log(unitDefDiff);

            const changes = this.getUnitDefChanges(previousUnitDef, currentUnitDef, unitDefDiff)?.[0] as ObjectChanges;
            unitChanges.push(changes);
        }

        return unitChanges;
    }

    protected async getUnitDef(filepath: string, sha: string) {
        const fileContent = await this.octokit.repos.getContent({
            owner: this.config.owner,
            repo: this.config.repo,
            path: filepath,
            ref: sha,
            mediaType: {
                format: "raw"
            }
        });

        const unitDef = this.parseUnitDef(fileContent.data.toString());
        
        return unitDef;
    }

    protected getUnitDefChanges(prevUnitDefObj?: any, newUnitDefObj?: any, diffObj?: any) : Array<ValueChange | ObjectChanges> {
        const changes: Array<ValueChange | ObjectChanges> = [];
        const name = (Object.entries(newUnitDefObj)?.[0]?.[1] as any)?.name as string | undefined;

        for (const [key, val] of Object.entries(diffObj)) {
            const unitDefProp: undefined | PreparedUnitDefProperty = unitDefProps[key];
            const prevValue = prevUnitDefObj[key];
            const newValue = newUnitDefObj[key];

            if (typeof val === "object" && !Array.isArray(val) && !this.isArrayChange(val)) {
                const change: ObjectChanges = {
                    propertyId: key,
                    propertyName: unitDefProp?.friendlyName ?? this.unitNames[key] ?? name ?? key,
                    changes: this.getUnitDefChanges(prevValue, newValue, val)
                }

                changes.push(change);
            } else {
                if (unitDefProp && unitDefProp.isBalanceChange === false) {
                    continue;
                }

                let changeType: ChangeType = ChangeType.UNKNOWN;

                const buffComparator = unitDefProp?.buffComparator;

                if (prevValue === undefined) {
                    changeType = ChangeType.ADDED;
                } else if (newValue === undefined) {
                    changeType = ChangeType.REMOVED;
                }
                
                if (buffComparator) {
                    changeType = buffComparator(prevValue, newValue) ? ChangeType.BUFF : ChangeType.NERF;
                }

                const change: ValueChange = {
                    propertyId: key,
                    propertyName: unitDefProp?.friendlyName ?? this.unitNames[key] ?? name ?? key,
                    prevValue,
                    newValue,
                    changeType
                }

                if (typeof prevValue === "number" && typeof newValue === "number") {
                    change.percentChange = (newValue - prevValue) / prevValue;
                } else if(Array.isArray(prevValue) && Array.isArray(newValue)) {
                    const added: Array<string | number> = [];
                    const removed: Array<string | number> = [];
                    for (const val of newValue) {
                        if (!prevValue.includes(val)) {
                            added.push(val);
                        }
                    }
                    for (const val of prevValue) {
                        if (!newValue.includes(val)) {
                            removed.push(val);
                        }
                    }
                    change.arrayChange = { added, removed };
                }

                changes.push(change);
            }
        }

        return changes;
    }

    protected isArrayChange(obj: any) : boolean {
        const key = Object.keys(obj)[0];
        const keyNum = Number(key);
        return typeof obj === "object" && !Array.isArray(obj) && !Number.isNaN(keyNum);
    }

    protected parseUnitDef(unitDefStr: string) : any {
        const parsedFile = luaparse.parse(unitDefStr, { encodingMode: "x-user-defined" });

        const returnBlock = parsedFile.body.find(chunk => chunk.type === "ReturnStatement") as ReturnStatement;
        const unitDef = this.parseProp(returnBlock.arguments[0]);

        return unitDef;
    }
    
    protected parseProp(expression: Expression, key?: string) : UnitDefObject | PrimitiveValue {
        const unitDef: UnitDefObject = {};
        const values: any[] = [];

        if (expression.type === "TableConstructorExpression") {
            for (const field of expression.fields) {
                if (field.type === "TableKeyString") {
                    unitDef[field.key.name] = this.parseProp(field.value, field.key.name);
                } else if (field.type === "TableKey") {
                    if (field.key.type === "NumericLiteral") {
                        values.push(this.parseProp(field.value));
                    }
                }
            }
        } else if (expression.type === "BooleanLiteral" || expression.type === "NumericLiteral") {
            return expression.value;
        } else if (expression.type === "StringLiteral" ) {
            if (key) {
                const unitDefSchema = unitDefProps[key];
                if (unitDefSchema && unitDefSchema.type === UnitDefValueType.STRING_ARRAY) {
                    return expression.value.split(" ");
                } else if (unitDefSchema && unitDefSchema.type === UnitDefValueType.NUMBER_ARRAY) {
                    return expression.value.split(" ").map(str => Number(str));
                }
            }

            return expression.value
        }

        if (values.length) {
            return values;
        }

        return unitDef;
    }

    protected async parseUnitNames(unitsEn: string) : Promise<{ [key: string]: string; }>{
        const parsedFile = luaparse.parse(unitsEn, { encodingMode: "x-user-defined" }) as any;
        const units = parsedFile.body[0].arguments[0].fields[0].value.fields[0].value.fields as TableKeyString[];
        const namesBlock = units.find(block => block.key.name === "names")?.value as TableConstructorExpression;
        const nameBlocks = namesBlock.fields as TableKeyString[];

        const unitNames: { [key: string]: string; } = {};
        for (const block of nameBlocks) {
            unitNames[block.key.name] = (block.value as StringLiteral).value;
        }

        return unitNames;
    }
}