/*
  Warnings:

  - You are about to drop the column `content` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Revision` table. All the data in the column will be lost.
  - Added the required column `blocks` to the `Note` table without a default value. This is not possible if the table is not empty.
  - Added the required column `blocks` to the `Revision` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "blocks" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Note" ("createdAt", "id", "title", "updatedAt", "version") SELECT "createdAt", "id", "title", "updatedAt", "version" FROM "Note";
DROP TABLE "Note";
ALTER TABLE "new_Note" RENAME TO "Note";
CREATE TABLE "new_Revision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "noteId" TEXT NOT NULL,
    "blocks" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Revision_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Revision" ("createdAt", "id", "noteId", "version") SELECT "createdAt", "id", "noteId", "version" FROM "Revision";
DROP TABLE "Revision";
ALTER TABLE "new_Revision" RENAME TO "Revision";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
