/*
  Warnings:

  - The primary key for the `templates_tags` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `templates_tags` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "templates_tags" DROP CONSTRAINT "templates_tags_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "templates_tags_pkey" PRIMARY KEY ("tagId", "templateId");
