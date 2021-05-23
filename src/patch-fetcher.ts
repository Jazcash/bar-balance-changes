import { Octokit } from "@octokit/rest";
import {diff } from "deep-object-diff";
import * as luaparse from "luaparse";
import { Expression, LocalStatement, ReturnStatement, StringLiteral, TableConstructorExpression, TableKeyString } from "luaparse";

import { Author, BalancePatch, BuffComparator, ObjectChanges, ObjectChangeType, PreparedUnitDefProperty, PrimitiveValue, UnitDefObject, UnitDefValueType, ValueChange, ValueChangeType } from "./types";
import { buffComparators, unitDefProps } from "./unitdef-props";

export interface PatchFetcherConfig {
    owner: string;
    repo: string;
    branch?: string;
    auth?: string;
    since?: Date;
    until?: Date;
    shas?: string[];
    upToSha?: string;
    numberOfCommits?: number;
}

export class PatchFetcher {
    public config: PatchFetcherConfig;

    protected octokit: Octokit;

    constructor(config: PatchFetcherConfig) {
        this.config = config;

        this.octokit = new Octokit({
            auth: this.config.auth
        });
    }

    public async fetchLatestBalancePatches() : Promise<BalancePatch[]> {
        const commits = await this.octokit.rest.repos.listCommits({
            owner: this.config.owner,
            repo: this.config.repo,
            sha: this.config.branch,
            path: "units",
            since: this.config?.since?.toISOString(),
            until: this.config?.until?.toISOString()
        });

        const balanceChanges: BalancePatch[] = [];

        let numOfCommitsProcessed = 0;
        for (const commit of commits.data) {
            if (numOfCommitsProcessed === this.config?.numberOfCommits) {
                break;
            }

            if (this.config?.shas?.length && !this.config?.shas.includes(commit.sha)) {
                continue;
            }

            if (commit.sha === this.config.upToSha) {
                break;
            }

            const balanceChange = await this.parseCommit(commit.sha);
            if (balanceChange) {
                balanceChanges.push(balanceChange);
            }

            numOfCommitsProcessed++;
        }

        return balanceChanges;
    }

    protected async parseCommit(sha: string) : Promise<BalancePatch | undefined> {
        try {
            const fullCommit = await this.octokit.rest.repos.getCommit({
                owner: this.config.owner,
                repo: this.config.repo,
                ref: sha
            });

            const date = new Date(fullCommit.data.commit.committer?.date!);
            const message = fullCommit.data.commit.message;
            const url = fullCommit.data.html_url;
            const author: Author = {
                name: fullCommit.data.commit.committer?.name!,
                avatarUrl: fullCommit.data.author?.avatar_url!,
                profileLink: fullCommit.data.author?.html_url!
            };

            const changes = await this.parseCommitBalanceChanges(sha);

            return { sha, date, message, url, author, changes };
        } catch (err) {
            console.log(err);
            console.log(`Error processing commit: ${sha}`);

            return;
        }
    }

    protected async parseCommitBalanceChanges(commitSha: string) : Promise<ObjectChanges[]> {
        try {
            const fullCommit = await this.octokit.rest.repos.getCommit({
                owner: this.config.owner,
                repo: this.config.repo,
                ref: commitSha
            });

            const parentSHA = fullCommit.data.parents[0].sha;

            const files = fullCommit.data.files ?? [];
            const unitChanges: ObjectChanges[] = [];
            for (const file of files) {
                if (file.filename && file.filename.match(/^units\/.*?\.lua$/)) {
                    try {
                        let previousUnitDef: any = undefined;
                        let currentUnitDef: any = undefined;

                        if (file.status === "modified") {
                            previousUnitDef = await this.getUnitDef(file.filename, parentSHA);
                            currentUnitDef = await this.getUnitDef(file.filename, commitSha);
                        } else if (file.status === "added") {
                            currentUnitDef = await this.getUnitDef(file.filename, commitSha);
                        } else if (file.status === "removed") {
                            previousUnitDef = await this.getUnitDef(file.filename, parentSHA);
                        }

                        const unitDefDiff = diff(previousUnitDef, currentUnitDef);

                        // console.log(JSON.stringify(unitDefDiff, null, 4));

                        const unitChange = this.getUnitDefChanges(previousUnitDef, currentUnitDef, unitDefDiff)?.[0] as ObjectChanges;

                        if (unitChange?.changes?.length && file.filename.includes("Scavengers")) {
                            unitChange.isScav = true;
                        }

                        if (unitChange?.changes?.length) {
                            unitChanges.push(unitChange);
                        }
                    } catch (err) {
                        console.log(err);
                        console.log(`Error parsing unitDef: ${file.filename} (${commitSha})`);
                    }
                }
            }

            return unitChanges;
        } catch (err) {
            console.log(err);
            console.log(`Error processing commit: ${commitSha}`);

            return [];
        }
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

        const unitDefProps = Object.values(unitDef)[0] as any;
        if (unitDefProps && unitDefProps?.weapons?.length && unitDefProps.weapondefs) {
            const newWeaponsObj: any = {};
            const weaponDefKeys = Object.keys(unitDefProps.weapondefs);
            unitDefProps.weapons.forEach((weaponObj: any, i: number) => {
                newWeaponsObj[weaponDefKeys[i]] = weaponObj;
            });
            unitDefProps.weapons = newWeaponsObj;
        }

        return unitDef;
    }

    protected getUnitDefChanges(prevUnitDefObj?: any, newUnitDefObj?: any, diffObj?: any) : Array<ValueChange | ObjectChanges> {
        const changes: Array<ValueChange | ObjectChanges> = [];
        let namePropValue = (Object.entries(newUnitDefObj)?.[0]?.[1] as any)?.name as string | undefined;
        if (typeof namePropValue !== "string") {
            namePropValue = undefined;
        }

        for (const [key, val] of Object.entries(diffObj)) {
            const unitDefProp: undefined | PreparedUnitDefProperty = unitDefProps[key];
            const prevValue = prevUnitDefObj?.[key];
            const newValue = newUnitDefObj?.[key];
            const propName = unitDefProp?.friendlyName ?? namePropValue ?? this.capitalise(key);

            if (unitDefProp && unitDefProp.isBalanceChange === false) {
                continue;
            }

            if (typeof val === "object" && !Array.isArray(val) && !this.isArrayChange(val)) {
                let changeType: ObjectChangeType = ObjectChangeType.MODIFIED;
                if (prevValue === undefined) {
                    changeType = ObjectChangeType.ADDED;
                } else if (newValue === undefined) {
                    changeType = ObjectChangeType.REMOVED;
                }

                let subChanges: Array<ObjectChanges | ValueChange> = this.getUnitDefChanges(prevValue, newValue, val);

                if (key === "damage") {
                    for (const change of (subChanges as ValueChange[])) {
                        change.propertyName = this.capitalise(change.propertyName);
                        change.changeType = this.getValueChangeType(change.prevValue, change.newValue, buffComparators.higherIsBetter );
                    }
                }

                const change: ObjectChanges = {
                    propertyId: key,
                    propertyName: propName,
                    changeType: changeType,
                    changes: subChanges
                };

                if (subChanges.length) {
                    changes.push(change);
                }
            } else {
                const buffComparator = unitDefProp?.buffComparator;

                const change: ValueChange = {
                    propertyId: key,
                    propertyName: propName,
                    prevValue,
                    newValue,
                    changeType: this.getValueChangeType(prevValue, newValue, buffComparator)
                };

                if (typeof prevValue === "number" && typeof newValue === "number") {
                    change.percentChange = (newValue - prevValue) / prevValue;
                } else if (Array.isArray(prevValue) && Array.isArray(newValue)) {
                    let added: any[] = [];
                    let removed: any[] = [];
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

    protected capitalise(str: string): string {
        return str[0].toUpperCase() + str.slice(1);
    }

    protected getValueChangeType(prevValue: any, newValue: any, buffComparator?: BuffComparator) : ValueChangeType {
        let changeType: ValueChangeType = ValueChangeType.UNKNOWN;

        if (prevValue === undefined) {
            changeType = ValueChangeType.ADDED;
        } else if (newValue === undefined) {
            changeType = ValueChangeType.REMOVED;
        } else if (buffComparator && ((typeof prevValue === "number" && typeof newValue === "number") || (typeof prevValue === "boolean" && typeof newValue === "boolean"))) {
            changeType = buffComparator(prevValue, newValue) ? ValueChangeType.BUFF : ValueChangeType.NERF;
        }

        return changeType;
    }

    protected parseUnitDef(unitDefStr: string) : any {
        const parsedFile = luaparse.parse(unitDefStr, { encodingMode: "x-user-defined" });

        let unitName: string | undefined;
        const localBlocks = (parsedFile.body.filter(block => block.type === "LocalStatement") || []) as LocalStatement[];
        for (const localBlock of localBlocks) {
            for (const init of localBlock.init) {
                if (init.type === "StringLiteral") {
                    unitName = init.value;
                }
            }
        }

        const returnBlock = parsedFile.body.find(block => block.type === "ReturnStatement") as ReturnStatement | undefined;
        const unitDef = this.parseProp(returnBlock!.arguments[0]);

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

            return expression.value;
        }

        if (values.length) {
            return values;
        }

        return unitDef;
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

        const parsedFile = luaparse.parse(unitsEn.data.toString(), { encodingMode: "x-user-defined" }) as any;
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