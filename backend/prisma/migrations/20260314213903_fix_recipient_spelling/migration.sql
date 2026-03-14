/*
  Warnings:

  - You are about to drop the column `receipientUserId` on the `HiddenPayload` table. All the data in the column will be lost.
  - Added the required column `recipientUserId` to the `HiddenPayload` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "HiddenPayload" DROP CONSTRAINT "HiddenPayload_receipientUserId_fkey";

-- DropIndex
DROP INDEX "HiddenPayload_receipientUserId_messageId_idx";

-- AlterTable
ALTER TABLE "HiddenPayload" DROP COLUMN "receipientUserId",
ADD COLUMN     "recipientUserId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "HiddenPayload_recipientUserId_messageId_idx" ON "HiddenPayload"("recipientUserId", "messageId");

-- AddForeignKey
ALTER TABLE "HiddenPayload" ADD CONSTRAINT "HiddenPayload_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
