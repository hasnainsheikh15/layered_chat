/*
  Warnings:

  - Added the required column `receipientUserId` to the `HiddenPayload` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HiddenPayload" ADD COLUMN     "receipientUserId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "HiddenPayload" ADD CONSTRAINT "HiddenPayload_receipientUserId_fkey" FOREIGN KEY ("receipientUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
