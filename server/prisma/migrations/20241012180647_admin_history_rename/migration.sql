/*
  Warnings:

  - You are about to drop the `AdminHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AdminHistory" DROP CONSTRAINT "AdminHistory_initiatorId_fkey";

-- DropForeignKey
ALTER TABLE "AdminHistory" DROP CONSTRAINT "AdminHistory_victimId_fkey";

-- DropTable
DROP TABLE "AdminHistory";

-- CreateTable
CREATE TABLE "admin_history" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "initiatorId" INTEGER NOT NULL,
    "victimId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "admin_history" ADD CONSTRAINT "admin_history_victimId_fkey" FOREIGN KEY ("victimId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_history" ADD CONSTRAINT "admin_history_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
