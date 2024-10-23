/*
  Warnings:

  - You are about to drop the `Form` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Form" DROP CONSTRAINT "Form_templateId_fkey";

-- DropForeignKey
ALTER TABLE "Form" DROP CONSTRAINT "Form_userId_fkey";

-- DropTable
DROP TABLE "Form";

-- CreateTable
CREATE TABLE "forms" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customString1Answer" TEXT,
    "customString2Answer" TEXT,
    "customString3Answer" TEXT,
    "customString4Answer" TEXT,
    "customInt1Answer" INTEGER,
    "customInt2Answer" INTEGER,
    "customInt3Answer" INTEGER,
    "customInt4Answer" INTEGER,
    "customText1Answer" TEXT,
    "customText2Answer" TEXT,
    "customText3Answer" TEXT,
    "customText4Answer" TEXT,
    "customBool1Answer" BOOLEAN,
    "customBool2Answer" BOOLEAN,
    "customBool3Answer" BOOLEAN,
    "customBool4Answer" BOOLEAN,

    CONSTRAINT "forms_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "forms" ADD CONSTRAINT "forms_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forms" ADD CONSTRAINT "forms_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
