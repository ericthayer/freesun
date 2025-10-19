/*
  # Update user_id columns to allow NULL for demo data

  ## Changes
    - Make user_id nullable in flight_logs for demo data support
    - Make created_by already nullable in launch_fields (no change needed)
    - Add is_demo columns to both tables
*/

-- Make user_id nullable in flight_logs
ALTER TABLE flight_logs ALTER COLUMN user_id DROP NOT NULL;

-- Add is_demo column to flight_logs if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'flight_logs' AND column_name = 'is_demo'
  ) THEN
    ALTER TABLE flight_logs ADD COLUMN is_demo boolean DEFAULT false;
  END IF;
END $$;

-- Add is_demo column to launch_fields if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'launch_fields' AND column_name = 'is_demo'
  ) THEN
    ALTER TABLE launch_fields ADD COLUMN is_demo boolean DEFAULT false;
  END IF;
END $$;

-- Create indexes on is_demo for faster queries
CREATE INDEX IF NOT EXISTS idx_flight_logs_is_demo ON flight_logs(is_demo);
CREATE INDEX IF NOT EXISTS idx_launch_fields_is_demo ON launch_fields(is_demo);
