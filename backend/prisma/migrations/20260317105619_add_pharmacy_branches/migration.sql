-- AlterTable
ALTER TABLE "job_postings" ADD COLUMN     "pharmacy_branch_id" BIGINT;

-- CreateTable
CREATE TABLE "pharmacy_branches" (
    "id" BIGSERIAL NOT NULL,
    "pharmacy_id" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "phone_number" VARCHAR(20),
    "fax_number" VARCHAR(20),
    "prefecture" VARCHAR(50),
    "address" TEXT,
    "nearest_station" VARCHAR(255),
    "minutes_from_station" INTEGER,
    "car_commute_available" BOOLEAN,
    "established_date" DATE,
    "daily_prescription_count" INTEGER,
    "staff_count" INTEGER,
    "business_hours_start" TIME(6),
    "business_hours_end" TIME(6),
    "introduction" TEXT,
    "strengths" TEXT,
    "equipment_systems" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pharmacy_branches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_pharmacy_branches_pharmacy_id" ON "pharmacy_branches"("pharmacy_id");

-- CreateIndex
CREATE INDEX "idx_job_postings_pharmacy_branch_id" ON "job_postings"("pharmacy_branch_id");

-- AddForeignKey
ALTER TABLE "pharmacy_branches" ADD CONSTRAINT "pharmacy_branches_pharmacy_id_fkey" FOREIGN KEY ("pharmacy_id") REFERENCES "pharmacies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_pharmacy_branch_id_fkey" FOREIGN KEY ("pharmacy_branch_id") REFERENCES "pharmacy_branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
