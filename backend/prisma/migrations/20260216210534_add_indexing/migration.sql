/*
  Warnings:

  - You are about to drop the column `hasHidden` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "hasHidden";

-- CreateIndex
CREATE INDEX "HiddenPayload_receipientUserId_messageId_idx" ON "HiddenPayload"("receipientUserId", "messageId");
