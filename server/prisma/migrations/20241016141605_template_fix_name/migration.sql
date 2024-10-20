/*
  Warnings:

  - You are about to drop the column `customBool41Description` on the `templates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "templates" DROP COLUMN "customBool41Description",
ADD COLUMN     "customBool4Description" TEXT;
