/*
  Warnings:

  - You are about to drop the column `deleliveredAt` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "deleliveredAt",
ADD COLUMN     "deliveredAt" TIMESTAMP(3);
