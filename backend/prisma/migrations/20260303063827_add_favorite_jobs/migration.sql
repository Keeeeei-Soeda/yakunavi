-- CreateTable
CREATE TABLE "favorite_jobs" (
    "id" BIGSERIAL NOT NULL,
    "pharmacist_id" BIGINT NOT NULL,
    "job_posting_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_favorite_jobs_pharmacist_id" ON "favorite_jobs"("pharmacist_id");

-- CreateIndex
CREATE INDEX "idx_favorite_jobs_job_posting_id" ON "favorite_jobs"("job_posting_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_jobs_pharmacist_id_job_posting_id_key" ON "favorite_jobs"("pharmacist_id", "job_posting_id");

-- AddForeignKey
ALTER TABLE "favorite_jobs" ADD CONSTRAINT "favorite_jobs_pharmacist_id_fkey" FOREIGN KEY ("pharmacist_id") REFERENCES "pharmacists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_jobs" ADD CONSTRAINT "favorite_jobs_job_posting_id_fkey" FOREIGN KEY ("job_posting_id") REFERENCES "job_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
