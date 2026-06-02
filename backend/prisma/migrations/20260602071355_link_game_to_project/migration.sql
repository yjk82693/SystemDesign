/*
  Warnings:

  - You are about to drop the `_ProjectToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `currentGame` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "_ProjectToUser_B_index";

-- DropIndex
DROP INDEX "_ProjectToUser_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_ProjectToUser";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_ProjectMembers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ProjectMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ProjectMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "publicId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "jobRole" TEXT NOT NULL DEFAULT 'Developer',
    "position" TEXT NOT NULL DEFAULT 'USER',
    "currentGameId" INTEGER,
    "dateOfBirth" TEXT NOT NULL,
    "dateRegistered" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_currentGameId_fkey" FOREIGN KEY ("currentGameId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("dateOfBirth", "dateRegistered", "email", "firstName", "id", "jobRole", "lastName", "password", "position", "publicId") SELECT "dateOfBirth", "dateRegistered", "email", "firstName", "id", "jobRole", "lastName", "password", "position", "publicId" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_publicId_key" ON "User"("publicId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectMembers_AB_unique" ON "_ProjectMembers"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectMembers_B_index" ON "_ProjectMembers"("B");
