/*
  Warnings:

  - A unique constraint covering the columns `[conversationId,userId]` on the table `ConversationParticipants` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "ConversationParticipants_userId_idx" ON "ConversationParticipants"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationParticipants_conversationId_userId_key" ON "ConversationParticipants"("conversationId", "userId");
