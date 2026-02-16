/*
  Warnings:

  - A unique constraint covering the columns `[conversationId,userId,joinedAt]` on the table `ConversationParticipants` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ConversationParticipants_conversationId_userId_key";

-- CreateIndex
CREATE INDEX "ConversationParticipants_conversationId_idx" ON "ConversationParticipants"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationParticipants_conversationId_userId_joinedAt_key" ON "ConversationParticipants"("conversationId", "userId", "joinedAt");
