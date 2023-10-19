/*
  Warnings:

  - You are about to drop the column `isEntrypoint` on the `Node` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Edge" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT (uuid()),
    "sourceNodeId" TEXT NOT NULL,
    "targetNodeId" TEXT NOT NULL,
    CONSTRAINT "Edge_sourceNodeId_fkey" FOREIGN KEY ("sourceNodeId") REFERENCES "Node" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Edge_targetNodeId_fkey" FOREIGN KEY ("targetNodeId") REFERENCES "Node" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Edge" ("id", "sourceNodeId", "targetNodeId") SELECT "id", "sourceNodeId", "targetNodeId" FROM "Edge";
DROP TABLE "Edge";
ALTER TABLE "new_Edge" RENAME TO "Edge";
CREATE TABLE "new_Node" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT (uuid()),
    "name" TEXT,
    "filename" TEXT,
    "line" INTEGER
);
INSERT INTO "new_Node" ("filename", "id", "line", "name") SELECT "filename", "id", "line", "name" FROM "Node";
DROP TABLE "Node";
ALTER TABLE "new_Node" RENAME TO "Node";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
