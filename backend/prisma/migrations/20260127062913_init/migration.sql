-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "user_type" VARCHAR(20) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "verification_token" VARCHAR(255),
    "verification_token_expires_at" TIMESTAMP(3),
    "reset_password_token" VARCHAR(255),
    "reset_password_token_expires_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pharmacies" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "pharmacy_name" VARCHAR(255) NOT NULL,
    "representative_last_name" VARCHAR(100) NOT NULL,
    "representative_first_name" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(20),
    "fax_number" VARCHAR(20),
    "prefecture" VARCHAR(50),
    "address" TEXT,
    "nearest_station" VARCHAR(255),
    "established_date" DATE,
    "daily_prescription_count" INTEGER,
    "staff_count" INTEGER,
    "business_hours_start" TIME,
    "business_hours_end" TIME,
    "introduction" TEXT,
    "strengths" TEXT,
    "equipment_systems" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pharmacies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pharmacists" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(20),
    "address" TEXT,
    "birth_date" DATE,
    "age" INTEGER,
    "university" VARCHAR(255),
    "graduation_year" INTEGER,
    "license_number" VARCHAR(255),
    "license_year" INTEGER,
    "certified_pharmacist_license" VARCHAR(255),
    "other_licenses" TEXT,
    "work_experience_years" INTEGER,
    "work_experience_months" INTEGER,
    "work_experience_types" TEXT[],
    "main_duties" TEXT[],
    "specialty_areas" TEXT[],
    "pharmacy_systems" TEXT[],
    "special_notes" TEXT,
    "self_introduction" TEXT,
    "license_file_url" VARCHAR(500),
    "registration_file_url" VARCHAR(500),
    "verification_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pharmacists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_postings" (
    "id" BIGSERIAL NOT NULL,
    "pharmacy_id" BIGINT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "work_location" VARCHAR(255) NOT NULL,
    "desired_work_days" INTEGER NOT NULL,
    "work_start_period_from" DATE NOT NULL,
    "work_start_period_to" DATE NOT NULL,
    "recruitment_deadline" DATE NOT NULL,
    "requirements" TEXT,
    "desired_work_hours" TEXT,
    "daily_wage" INTEGER NOT NULL,
    "total_compensation" INTEGER NOT NULL,
    "platform_fee" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "application_count" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_postings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" BIGSERIAL NOT NULL,
    "job_posting_id" BIGINT NOT NULL,
    "pharmacist_id" BIGINT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "cover_letter" TEXT,
    "nearest_station" VARCHAR(255),
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "offered_at" TIMESTAMP(3),
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" BIGSERIAL NOT NULL,
    "application_id" BIGINT NOT NULL,
    "sender_type" VARCHAR(20) NOT NULL,
    "sender_id" BIGINT NOT NULL,
    "message_type" VARCHAR(30) NOT NULL DEFAULT 'text',
    "message_content" TEXT,
    "structured_data" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" BIGSERIAL NOT NULL,
    "application_id" BIGINT NOT NULL,
    "pharmacy_id" BIGINT NOT NULL,
    "pharmacist_id" BIGINT NOT NULL,
    "job_posting_id" BIGINT NOT NULL,
    "initial_work_date" DATE NOT NULL,
    "work_days" INTEGER NOT NULL,
    "daily_wage" INTEGER NOT NULL,
    "total_compensation" INTEGER NOT NULL,
    "platform_fee" INTEGER NOT NULL,
    "work_hours" VARCHAR(255),
    "status" VARCHAR(30) NOT NULL DEFAULT 'pending_approval',
    "contract_start_date" DATE,
    "contract_end_date" DATE,
    "payment_deadline" DATE NOT NULL,
    "approved_at" TIMESTAMP(3),
    "payment_confirmed_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "cancellation_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" BIGSERIAL NOT NULL,
    "contract_id" BIGINT NOT NULL,
    "pharmacy_id" BIGINT NOT NULL,
    "amount" INTEGER NOT NULL,
    "payment_type" VARCHAR(20) NOT NULL DEFAULT 'platform_fee',
    "payment_method" VARCHAR(30),
    "payment_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "payment_date" DATE,
    "transfer_name" VARCHAR(255),
    "confirmation_note" TEXT,
    "reported_at" TIMESTAMP(3),
    "confirmed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" BIGSERIAL NOT NULL,
    "contract_id" BIGINT,
    "pharmacy_id" BIGINT,
    "pharmacist_id" BIGINT,
    "document_type" VARCHAR(30) NOT NULL,
    "document_title" VARCHAR(255) NOT NULL,
    "file_path" VARCHAR(500) NOT NULL,
    "file_size" INTEGER,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "downloaded_by_pharmacy" BOOLEAN NOT NULL DEFAULT false,
    "pharmacy_downloaded_at" TIMESTAMP(3),
    "downloaded_by_pharmacist" BOOLEAN NOT NULL DEFAULT false,
    "pharmacist_downloaded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penalties" (
    "id" BIGSERIAL NOT NULL,
    "pharmacy_id" BIGINT NOT NULL,
    "contract_id" BIGINT,
    "penalty_type" VARCHAR(30) NOT NULL,
    "reason" TEXT NOT NULL,
    "penalty_status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "imposed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "resolution_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "penalties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "notification_type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "link_url" VARCHAR(500),
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_user_type" ON "users"("user_type");

-- CreateIndex
CREATE INDEX "idx_users_verification_token" ON "users"("verification_token");

-- CreateIndex
CREATE INDEX "idx_users_reset_password_token" ON "users"("reset_password_token");

-- CreateIndex
CREATE UNIQUE INDEX "pharmacies_user_id_key" ON "pharmacies"("user_id");

-- CreateIndex
CREATE INDEX "idx_pharmacies_user_id" ON "pharmacies"("user_id");

-- CreateIndex
CREATE INDEX "idx_pharmacies_prefecture" ON "pharmacies"("prefecture");

-- CreateIndex
CREATE UNIQUE INDEX "pharmacists_user_id_key" ON "pharmacists"("user_id");

-- CreateIndex
CREATE INDEX "idx_pharmacists_user_id" ON "pharmacists"("user_id");

-- CreateIndex
CREATE INDEX "idx_pharmacists_age" ON "pharmacists"("age");

-- CreateIndex
CREATE INDEX "idx_pharmacists_work_experience" ON "pharmacists"("work_experience_years");

-- CreateIndex
CREATE INDEX "idx_pharmacists_verification_status" ON "pharmacists"("verification_status");

-- CreateIndex
CREATE INDEX "idx_job_postings_pharmacy_id" ON "job_postings"("pharmacy_id");

-- CreateIndex
CREATE INDEX "idx_job_postings_status" ON "job_postings"("status");

-- CreateIndex
CREATE INDEX "idx_job_postings_deadline" ON "job_postings"("recruitment_deadline");

-- CreateIndex
CREATE INDEX "idx_job_postings_published_at" ON "job_postings"("published_at");

-- CreateIndex
CREATE INDEX "idx_job_postings_search" ON "job_postings"("status", "daily_wage");

-- CreateIndex
CREATE INDEX "idx_applications_job_posting_id" ON "applications"("job_posting_id");

-- CreateIndex
CREATE INDEX "idx_applications_pharmacist_id" ON "applications"("pharmacist_id");

-- CreateIndex
CREATE INDEX "idx_applications_status" ON "applications"("status");

-- CreateIndex
CREATE INDEX "idx_applications_applied_at" ON "applications"("applied_at");

-- CreateIndex
CREATE UNIQUE INDEX "applications_job_posting_id_pharmacist_id_key" ON "applications"("job_posting_id", "pharmacist_id");

-- CreateIndex
CREATE INDEX "idx_messages_application_id" ON "messages"("application_id");

-- CreateIndex
CREATE INDEX "idx_messages_created_at" ON "messages"("created_at");

-- CreateIndex
CREATE INDEX "idx_messages_is_read" ON "messages"("is_read");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_application_id_key" ON "contracts"("application_id");

-- CreateIndex
CREATE INDEX "idx_contracts_application_id" ON "contracts"("application_id");

-- CreateIndex
CREATE INDEX "idx_contracts_pharmacy_id" ON "contracts"("pharmacy_id");

-- CreateIndex
CREATE INDEX "idx_contracts_pharmacist_id" ON "contracts"("pharmacist_id");

-- CreateIndex
CREATE INDEX "idx_contracts_status" ON "contracts"("status");

-- CreateIndex
CREATE INDEX "idx_contracts_payment_deadline" ON "contracts"("payment_deadline");

-- CreateIndex
CREATE INDEX "idx_contracts_initial_work_date" ON "contracts"("initial_work_date");

-- CreateIndex
CREATE UNIQUE INDEX "payments_contract_id_key" ON "payments"("contract_id");

-- CreateIndex
CREATE INDEX "idx_payments_contract_id" ON "payments"("contract_id");

-- CreateIndex
CREATE INDEX "idx_payments_pharmacy_id" ON "payments"("pharmacy_id");

-- CreateIndex
CREATE INDEX "idx_payments_payment_status" ON "payments"("payment_status");

-- CreateIndex
CREATE INDEX "idx_payments_payment_date" ON "payments"("payment_date");

-- CreateIndex
CREATE INDEX "idx_documents_contract_id" ON "documents"("contract_id");

-- CreateIndex
CREATE INDEX "idx_documents_pharmacy_id" ON "documents"("pharmacy_id");

-- CreateIndex
CREATE INDEX "idx_documents_pharmacist_id" ON "documents"("pharmacist_id");

-- CreateIndex
CREATE INDEX "idx_documents_document_type" ON "documents"("document_type");

-- CreateIndex
CREATE INDEX "idx_penalties_pharmacy_id" ON "penalties"("pharmacy_id");

-- CreateIndex
CREATE INDEX "idx_penalties_penalty_status" ON "penalties"("penalty_status");

-- CreateIndex
CREATE INDEX "idx_penalties_imposed_at" ON "penalties"("imposed_at");

-- CreateIndex
CREATE INDEX "idx_notifications_user_id" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "idx_notifications_is_read" ON "notifications"("is_read");

-- CreateIndex
CREATE INDEX "idx_notifications_created_at" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "idx_notifications_notification_type" ON "notifications"("notification_type");

-- AddForeignKey
ALTER TABLE "pharmacies" ADD CONSTRAINT "pharmacies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacists" ADD CONSTRAINT "pharmacists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_pharmacy_id_fkey" FOREIGN KEY ("pharmacy_id") REFERENCES "pharmacies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_posting_id_fkey" FOREIGN KEY ("job_posting_id") REFERENCES "job_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_pharmacist_id_fkey" FOREIGN KEY ("pharmacist_id") REFERENCES "pharmacists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_pharmacy_id_fkey" FOREIGN KEY ("pharmacy_id") REFERENCES "pharmacies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_pharmacist_id_fkey" FOREIGN KEY ("pharmacist_id") REFERENCES "pharmacists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_job_posting_id_fkey" FOREIGN KEY ("job_posting_id") REFERENCES "job_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_pharmacy_id_fkey" FOREIGN KEY ("pharmacy_id") REFERENCES "pharmacies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_pharmacy_id_fkey" FOREIGN KEY ("pharmacy_id") REFERENCES "pharmacies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_pharmacist_id_fkey" FOREIGN KEY ("pharmacist_id") REFERENCES "pharmacists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penalties" ADD CONSTRAINT "penalties_pharmacy_id_fkey" FOREIGN KEY ("pharmacy_id") REFERENCES "pharmacies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
