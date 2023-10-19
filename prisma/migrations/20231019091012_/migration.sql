/*
  Warnings:

  - Added the required column `isEntrypoint` to the `Node` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Node" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "filename" TEXT,
    "line" INTEGER,
    "isEntrypoint" BOOLEAN NOT NULL
);
INSERT INTO "new_Node" ("filename", "id", "line", "name") SELECT "filename", "id", "line", "name" FROM "Node";
DROP TABLE "Node";
ALTER TABLE "new_Node" RENAME TO "Node";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
