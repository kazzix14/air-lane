/*
  Warnings:

  - The primary key for the `Node` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Node` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `Edge` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Edge` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `sourceNodeId` on the `Edge` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `targetNodeId` on the `Edge` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Node" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "filename" TEXT,
    "line" INTEGER
);
INSERT INTO "new_Node" ("filename", "id", "line", "name") SELECT "filename", "id", "line", "name" FROM "Node";
DROP TABLE "Node";
ALTER TABLE "new_Node" RENAME TO "Node";
CREATE UNIQUE INDEX "Node_name_key" ON "Node"("name");
CREATE TABLE "new_Edge" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sourceNodeId" INTEGER NOT NULL,
    "targetNodeId" INTEGER NOT NULL,
    CONSTRAINT "Edge_sourceNodeId_fkey" FOREIGN KEY ("sourceNodeId") REFERENCES "Node" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Edge_targetNodeId_fkey" FOREIGN KEY ("targetNodeId") REFERENCES "Node" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Edge" ("id", "sourceNodeId", "targetNodeId") SELECT "id", "sourceNodeId", "targetNodeId" FROM "Edge";
DROP TABLE "Edge";
ALTER TABLE "new_Edge" RENAME TO "Edge";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
