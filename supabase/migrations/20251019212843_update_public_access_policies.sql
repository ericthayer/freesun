/*
  # Update RLS Policies for Public Access

  ## Changes
    
    1. Flight Logs - Public Access
      - Remove existing restrictive policies
      - Allow anonymous users to view all flight logs
      - Allow anonymous users to create, update, and delete flight logs
      - Track creation via session or anonymous ID where possible

    2. Launch Fields - Public Access
      - Remove existing restrictive policies
      - Allow anonymous users to view all launch fields
      - Allow anonymous users to create, update, and delete launch fields

  ## Security Note
    
    These changes enable full public access to both tables. This is suitable for
    open community applications but should be monitored for abuse.
*/

-- Drop existing restrictive policies for flight_logs
DROP POLICY IF EXISTS "Users can view own flight logs" ON flight_logs;
DROP POLICY IF EXISTS "Users can insert own flight logs" ON flight_logs;
DROP POLICY IF EXISTS "Users can update own flight logs" ON flight_logs;
DROP POLICY IF EXISTS "Users can delete own flight logs" ON flight_logs;

-- Create public access policies for flight_logs
CREATE POLICY "Public can view all flight logs"
  ON flight_logs FOR SELECT
  USING (true);

CREATE POLICY "Public can insert flight logs"
  ON flight_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update flight logs"
  ON flight_logs FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete flight logs"
  ON flight_logs FOR DELETE
  USING (true);

-- Drop existing restrictive policies for launch_fields
DROP POLICY IF EXISTS "Anyone can view public launch fields" ON launch_fields;
DROP POLICY IF EXISTS "Authenticated users can create launch fields" ON launch_fields;
DROP POLICY IF EXISTS "Users can update own launch fields" ON launch_fields;
DROP POLICY IF EXISTS "Users can delete own launch fields" ON launch_fields;

-- Create public access policies for launch_fields
CREATE POLICY "Public can view all launch fields"
  ON launch_fields FOR SELECT
  USING (true);

CREATE POLICY "Public can insert launch fields"
  ON launch_fields FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update launch fields"
  ON launch_fields FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete launch fields"
  ON launch_fields FOR DELETE
  USING (true);
