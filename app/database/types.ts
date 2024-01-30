import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type Edge = {
    id: Generated<number>;
    projectId: number;
    sourceNodeId: number;
    targetNodeId: number;
};
export type Node = {
    id: Generated<number>;
    name: string;
    filename: string | null;
    line: number | null;
    projectId: number;
};
export type Project = {
    id: Generated<number>;
    name: string;
};
export type DB = {
    Edge: Edge;
    Node: Node;
    Project: Project;
};
