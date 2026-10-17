-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Review_orderId_key" ON "Review"("orderId");
