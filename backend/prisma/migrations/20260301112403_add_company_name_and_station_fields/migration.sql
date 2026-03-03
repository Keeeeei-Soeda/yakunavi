-- Step 1: Add new columns (company_name as nullable first for existing data)
ALTER TABLE "pharmacies" ADD COLUMN "company_name" VARCHAR(255);
ALTER TABLE "pharmacies" ADD COLUMN "minutes_from_station" INTEGER;
ALTER TABLE "pharmacies" ADD COLUMN "car_commute_available" BOOLEAN;

-- Step 2: Populate company_name from pharmacy_name for existing rows
UPDATE "pharmacies" SET "company_name" = "pharmacy_name" WHERE "company_name" IS NULL;

-- Step 3: Make company_name required
ALTER TABLE "pharmacies" ALTER COLUMN "company_name" SET NOT NULL;

-- Step 4: Make pharmacy_name optional
ALTER TABLE "pharmacies" ALTER COLUMN "pharmacy_name" DROP NOT NULL;
