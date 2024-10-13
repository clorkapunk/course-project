-- CreateTable
CREATE TABLE "AdminHistory" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "initiatorId" INTEGER NOT NULL,
    "victimId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AdminHistory" ADD CONSTRAINT "AdminHistory_victimId_fkey" FOREIGN KEY ("victimId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminHistory" ADD CONSTRAINT "AdminHistory_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
