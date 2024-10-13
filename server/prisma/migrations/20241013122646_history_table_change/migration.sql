/*
  Warnings:

  - You are about to drop the column `action` on the `admin_history` table. All the data in the column will be lost.
  - Added the required column `action_type` to the `admin_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `new_value` to the `admin_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `old_value` to the `admin_history` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "admin_history" DROP COLUMN "action",
ADD COLUMN     "action_type" TEXT NOT NULL,
ADD COLUMN     "new_value" TEXT NOT NULL,
ADD COLUMN     "old_value" TEXT NOT NULL;
