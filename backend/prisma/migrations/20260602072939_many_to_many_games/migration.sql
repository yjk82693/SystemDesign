/*
  Warnings:

  - You are about to drop the column `currentGameId` on the `User` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_UserGames" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_UserGames_A_fkey" FOREIGN KEY ("A") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_UserGames_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "dateOfBirth" TEXT NOT NULL,
    "dateRegistered" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("dateOfBirth", "dateRegistered", "email", "firstName", "id", "jobRole", "lastName", "password", "position", "publicId") SELECT "dateOfBirth", "dateRegistered", "email", "firstName", "id", "jobRole", "lastName", "password", "position", "publicId" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_publicId_key" ON "User"("publicId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_UserGames_AB_unique" ON "_UserGames"("A", "B");

-- CreateIndex
CREATE INDEX "_UserGames_B_index" ON "_UserGames"("B");
