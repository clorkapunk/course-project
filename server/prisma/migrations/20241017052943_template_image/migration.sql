/*
  Warnings:

  - You are about to drop the column `imageId` on the `templates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "templates" DROP COLUMN "imageId",
ADD COLUMN     "image" TEXT;
