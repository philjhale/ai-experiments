-- CreateTable
CREATE TABLE "Job" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL,
    "locationType" TEXT NOT NULL,
    "applicationUrl" TEXT NOT NULL,
    "postedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
