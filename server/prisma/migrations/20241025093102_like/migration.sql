/*
  Warnings:

  - The primary key for the `likes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `likes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "likes" DROP CONSTRAINT "likes_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "likes_pkey" PRIMARY KEY ("userId", "templateId");
