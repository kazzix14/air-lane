import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type Edge = {
    id: Generated<number>;
    sourceNodeId: number;
    targetNodeId: number;
};
export type Node = {
    id: Generated<number>;
    name: string;
    filename: string | null;
    line: number | null;
};
export type DB = {
    Edge: Edge;
    Node: Node;
};
