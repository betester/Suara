-- CreateTable
CREATE TABLE "User" (
    "username" TEXT NOT NULL,
    "timeSpent" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("username")
);

-- CreateTable
CREATE TABLE "UserTimeSpent" (
    "id" SERIAL NOT NULL,
    "timeSpentTogether" DOUBLE PRECISION NOT NULL,
    "userOneId" TEXT NOT NULL,
    "userSpentWith" TEXT NOT NULL,

    CONSTRAINT "UserTimeSpent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserTimeSpent_userSpentWith_key" ON "UserTimeSpent"("userSpentWith");

-- AddForeignKey
ALTER TABLE "UserTimeSpent" ADD CONSTRAINT "UserTimeSpent_userOneId_fkey" FOREIGN KEY ("userOneId") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
