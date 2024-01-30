/*
  Warnings:

  - Added the required column `projectId` to the `Edge` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Edge" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectId" INTEGER NOT NULL,
    "sourceNodeId" INTEGER NOT NULL,
    "targetNodeId" INTEGER NOT NULL,
    CONSTRAINT "Edge_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Edge_sourceNodeId_fkey" FOREIGN KEY ("sourceNodeId") REFERENCES "Node" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Edge_targetNodeId_fkey" FOREIGN KEY ("targetNodeId") REFERENCES "Node" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Edge" ("id", "sourceNodeId", "targetNodeId") SELECT "id", "sourceNodeId", "targetNodeId" FROM "Edge";
DROP TABLE "Edge";
ALTER TABLE "new_Edge" RENAME TO "Edge";
CREATE UNIQUE INDEX "Edge_sourceNodeId_targetNodeId_key" ON "Edge"("sourceNodeId", "targetNodeId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
