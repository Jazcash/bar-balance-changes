
export enum UnitDefValueType {
    STRING,
    STRING_ARRAY,
    NUMBER,
    NUMBER_ARRAY,
    BOOLEAN,
    NUMBER_MAP,
    ANY_MAP,
    UNITDEF_OBJECT
}

export enum ChangeType {
    BUFF = "Buff",
    NERF = "Nerf",
    ADDED = "Added",
    REMOVED ="Removed",
    REWORK = "Rework",
    UNKNOWN = "Unknown"
}

export interface BalancePatch {
    sha: string;
    url: string;
    branch: string;
    author: Author;
    date: Date;
    message: string;
    changes: ObjectChanges[];
}

export interface Author {
    name: string;
    avatarUrl: string;
    profileLink: string;
}

export interface ObjectChanges {
    propertyId: string;
    propertyName: string;
    changes: Array<ValueChange | ObjectChanges>;
}

export interface ValueChange {
    propertyId: string;
    propertyName: string;
    prevValue: PrimitiveValue;
    newValue: PrimitiveValue;
    changeType: ChangeType;
    percentChange?: number;
    arrayChange?: {
        added: Array<string | number>;
        removed: Array<string | number>;
    }
}

export type UnitDefObject = { [key: string]: PrimitiveValue | UnitDefObject };

export type PrimitiveValue = string | string[] | number | number[] | boolean;

export interface PreparsedUnitDef {
    [key: string]: PreparedUnitDefProperty;
}

export interface PreparedUnitDefProperty {
    friendlyName: string;
    type: UnitDefValueType;
    buffComparator?: IsBuffComparator<any>;
    isBalanceChange?: boolean;
    isLuaTable?: boolean;
}

export type IsBuffComparator<T = PrimitiveValue> = (prev: T, curr: T) => boolean;