-- CreateTable
CREATE TABLE "business_hours" (
    "id" BIGSERIAL NOT NULL,
    "pharmacy_branch_id" BIGINT NOT NULL,
    "day_of_week" VARCHAR(3) NOT NULL,
    "open_time" VARCHAR(5),
    "close_time" VARCHAR(5),
    "is_closed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_hours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_business_hours_branch_day" ON "business_hours"("pharmacy_branch_id", "day_of_week");

-- CreateIndex
CREATE INDEX "idx_business_hours_branch_id" ON "business_hours"("pharmacy_branch_id");

-- AddForeignKey
ALTER TABLE "business_hours" ADD CONSTRAINT "business_hours_pharmacy_branch_id_fkey" FOREIGN KEY ("pharmacy_branch_id") REFERENCES "pharmacy_branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
