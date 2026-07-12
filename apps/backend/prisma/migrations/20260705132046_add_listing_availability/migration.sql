-- CreateEnum
CREATE TYPE "Availability" AS ENUM ('ON_HAND', 'PRE_ORDER', 'DELIVERED');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "availability" "Availability" NOT NULL DEFAULT 'ON_HAND';
