/*
  Warnings:

  - You are about to drop the column `image` on the `templates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "templates" DROP COLUMN "image",
ADD COLUMN     "imageId" TEXT,
ALTER COLUMN "customString1State" SET DEFAULT 'NOT_PRESENT',
ALTER COLUMN "customString2State" SET DEFAULT 'NOT_PRESENT',
ALTER COLUMN "customString3State" SET DEFAULT 'NOT_PRESENT',
ALTER COLUMN "customString4State" SET DEFAULT 'NOT_PRESENT',
ALTER COLUMN "customInt1State" SET DEFAULT 'NOT_PRESENT',
ALTER COLUMN "customInt2State" SET DEFAULT 'NOT_PRESENT',
ALTER COLUMN "customInt3State" SET DEFAULT 'NOT_PRESENT',
ALTER COLUMN "customInt4State" SET DEFAULT 'NOT_PRESENT',
ALTER COLUMN "customText1State" SET DEFAULT 'NOT_PRESENT',
ALTER COLUMN "customText2State" SET DEFAULT 'NOT_PRESENT',
ALTER COLUMN "customText3State" SET DEFAULT 'NOT_PRESENT',
ALTER COLUMN "customText4State" SET DEFAULT 'NOT_PRESENT',
ALTER COLUMN "customBool1State" SET DEFAULT 'NOT_PRESENT',
ALTER COLUMN "customBool2State" SET DEFAULT 'NOT_PRESENT',
ALTER COLUMN "customBool3State" SET DEFAULT 'NOT_PRESENT',
ALTER COLUMN "customBool4State" SET DEFAULT 'NOT_PRESENT';
