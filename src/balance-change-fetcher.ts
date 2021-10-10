import { Octokit } from "@octokit/rest";
import {diff } from "deep-object-diff";
import * as luaparse from "luaparse";
import { Expression, LocalStatement, ReturnStatement, StringLiteral, TableConstructorExpression, TableKeyString } from "luaparse";

import { Author, BalanceChange, BuffComparator, ObjectChanges, ObjectChangeType, PreparedUnitDefProperty, PrimitiveValue, UnitDefObject, UnitDefValueType, ValueChange, ValueChangeType } from "./types";
import { buffComparators, unitDefProps } from "./unitdef-props";

export interface BalanceChangeFetcherConfig {
    owner: string;
    repo: string;
    branch?: string;
    auth?: string;
    errorLoggingFunction?: (str: string) => void;
}

const defaultBalanceChangeFetcherConfig: BalanceChangeFetcherConfig = {
    owner: "beyond-all-reason",
    repo: "beyond-all-reason",
    errorLoggingFunction: console.error
};

export interface FetchOptions {
    since?: Date;
    until?: Date;
    excludeShas?: string[];
    upToSha?: string;
    limit?: number;
    page?: number;
    perPage?: number;
    sha?: string;
}

export class BalanceChangeFetcher {
    public config: BalanceChangeFetcherConfig;

    protected octokit: Octokit;
    protected unitNames: { [key: string]: string; } = {};

    constructor(config: BalanceChangeFetcherConfig) {
        this.config = Object.assign({}, defaultBalanceChangeFetcherConfig, config);

        this.octokit = new Octokit({
            auth: this.config.auth
        });
    }

    public async fetchLatestBalanceChanges(options?: FetchOptions) : Promise<BalanceChange[]> {
        this.unitNames = await this.fetchUnitNames();

        const commits = await this.octokit.rest.repos.listCommits({
            owner: this.config.owner,
            repo: this.config.repo,
            sha: this.config.branch,
            path: "units",
            since: options?.since?.toISOString(),
            until: options?.until?.toISOString(),
            page: options?.page,
            per_page: options?.perPage
        });

        const balanceChanges: BalanceChange[] = [];

        if (options?.sha) {
            const commit = commits.data.find(commit => commit.sha === options.sha);
            if (commit) {
                commits.data = [commit];
            }
        }

        let numOfCommitsProcessed = 0;
        for (const commit of commits.data) {
            try {
                if (numOfCommitsProcessed === options?.limit) {
                    break;
                }

                if (options?.excludeShas?.length && options.excludeShas.includes(commit.sha)) {
                    // console.log(`Skipping commit ${commit.sha}`);
                    continue;
                }

                if (commit.sha === options?.upToSha) {
                    break;
                }

                console.log(`Fetching commit ${commit.sha}`);
                const balanceChange = await this.parseCommit(commit.sha);
                if (balanceChange) {
                    balanceChanges.push(balanceChange);
                }
            } catch (err) {
                //this.config.errorLoggingFunction!(err);
                console.error(err);
                console.log(`There was an error processing ${commit.sha}`);
            }

            numOfCommitsProcessed++;
        }

        return balanceChanges;
    }

    protected async parseCommit(sha: string) : Promise<BalanceChange | undefined> {
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
                name: fullCommit.data.author?.login!,
                avatarUrl: fullCommit.data.author?.avatar_url!,
                profileLink: fullCommit.data.author?.html_url!
            };

            const changes = await this.parseCommitBalanceChanges(sha);

            return { sha, date, message, url, author, changes };
        } catch (err) {
            //this.config.errorLoggingFunction!(err);
            console.error(err);
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
                if (file.filename && file.filename.match(/^units\/.*?\.lua$/) && !file.filename.includes("other") && !file.filename.includes("Scavengers")) {
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

                        const unitChange = this.getUnitDefChanges(previousUnitDef, currentUnitDef, unitDefDiff)?.[0] as ObjectChanges;

                        if (unitChange?.changes?.length) {
                            unitChanges.push(unitChange);
                        }
                    } catch (err) {
                        //this.config.errorLoggingFunction!(err);
                        console.error(err);
                        console.log(`Error parsing unitDef: ${file.filename} (${commitSha})`);
                    }
                }
            }

            return unitChanges;
        } catch (err) {
            //this.config.errorLoggingFunction!(err);
            console.error(err);
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

    protected getUnitDefChanges(prevUnitDefObj?: any, newUnitDefObj?: any, diffObj?: any, isCustomParams = false) : Array<ValueChange | ObjectChanges> {
        const changes: Array<ValueChange | ObjectChanges> = [];
        let namePropValue = (Object.entries(newUnitDefObj)?.[0]?.[1] as any)?.name as string | undefined;
        if (typeof namePropValue !== "string") {
            namePropValue = undefined;
        }

        for (const [key, val] of Object.entries(diffObj)) {
            const unitDefProp: undefined | PreparedUnitDefProperty = unitDefProps[key] || unitDefProps[key.toLowerCase()];
            const prevValue = prevUnitDefObj?.[key];
            const newValue = newUnitDefObj?.[key];
            const propName = unitDefProp?.friendlyName ?? this.unitNames[key] ?? namePropValue ?? this.capitalise(key);

            if (unitDefProp && unitDefProp.isBalanceChange === false) {
                continue;
            }

            if (isCustomParams && key !== "paralyzemultiplier") {
                continue;
            }

            if (typeof val === "object" && !Array.isArray(val) && !this.isArrayChange(val)) {
                let changeType: ObjectChangeType = ObjectChangeType.MODIFIED;
                if (prevValue === undefined) {
                    changeType = ObjectChangeType.ADDED;
                } else if (newValue === undefined) {
                    changeType = ObjectChangeType.REMOVED;
                }

                let subChanges: Array<ObjectChanges | ValueChange> = this.getUnitDefChanges(prevValue, newValue, val, key === "customparams");

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
        const parsedFile = luaparse.parse(unitDefStr, { encodingMode: "x-user-defined", comments: false });

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

    // TODO: move this into bar-db
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