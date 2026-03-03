-- AlterTable
ALTER TABLE "pharmacists" ADD COLUMN     "nearest_station" VARCHAR(255);

-- CreateTable
CREATE TABLE "certificates" (
    "id" BIGSERIAL NOT NULL,
    "pharmacist_id" BIGINT NOT NULL,
    "certificate_type" VARCHAR(30) NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_path" VARCHAR(500) NOT NULL,
    "file_size" INTEGER,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verification_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "verified_at" TIMESTAMP(3),
    "verified_by" BIGINT,
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_certificates_pharmacist_id" ON "certificates"("pharmacist_id");

-- CreateIndex
CREATE INDEX "idx_certificates_certificate_type" ON "certificates"("certificate_type");

-- CreateIndex
CREATE INDEX "idx_certificates_verification_status" ON "certificates"("verification_status");

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_pharmacist_id_fkey" FOREIGN KEY ("pharmacist_id") REFERENCES "pharmacists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
