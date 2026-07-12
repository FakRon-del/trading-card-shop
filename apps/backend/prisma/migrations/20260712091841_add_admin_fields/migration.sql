-- AlterTable
ALTER TABLE "Seller" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isBanned" BOOLEAN NOT NULL DEFAULT false;
