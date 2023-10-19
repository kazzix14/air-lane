/*
  Warnings:

  - A unique constraint covering the columns `[sourceNodeId,targetNodeId]` on the table `Edge` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Edge_sourceNodeId_targetNodeId_key" ON "Edge"("sourceNodeId", "targetNodeId");
