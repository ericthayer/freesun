/*
  # Flight Logs and Launch Fields Schema

  ## 1. New Tables
    
    ### `flight_logs`
      - `id` (uuid, primary key) - Unique identifier for each flight log
      - `user_id` (uuid, foreign key) - References auth.users
      - `flight_date` (date) - Date of the flight
      - `location` (text) - Flight location name
      - `airport_code` (text) - ICAO airport code for weather reference
      - `launch_field_id` (uuid, nullable) - Optional reference to launch_fields
      - `duration_minutes` (integer) - Flight duration
      - `max_altitude_feet` (integer) - Maximum altitude reached
      - `weather_conditions` (jsonb) - Stored weather data at time of flight
      - `notes` (text, nullable) - Additional flight notes
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

    ### `launch_fields`
      - `id` (uuid, primary key) - Unique identifier for each launch field
      - `name` (text) - Name of the launch field
      - `description` (text, nullable) - Field description
      - `latitude` (decimal) - GPS latitude
      - `longitude` (decimal) - GPS longitude
      - `elevation_feet` (integer) - Field elevation
      - `airport_code` (text, nullable) - Nearest airport ICAO code
      - `restrictions` (text, nullable) - Any flight restrictions
      - `facilities` (text[], nullable) - Available facilities
      - `contact_info` (text, nullable) - Contact information
      - `is_public` (boolean) - Whether field is public or private
      - `created_by` (uuid, foreign key) - References auth.users
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  ## 2. Security
    
    - Enable RLS on both tables
    - Users can read all public launch fields
    - Users can only read their own flight logs
    - Users can create/update/delete their own records
    - Users can create public launch fields (visible to all)
    - Users can only update/delete launch fields they created

  ## 3. Indexes
    
    - Index on flight_logs.user_id for fast user queries
    - Index on flight_logs.flight_date for date-based filtering
    - Index on launch_fields.latitude and longitude for location queries
    - Index on launch_fields.is_public for filtering public fields
*/

-- Create flight_logs table
CREATE TABLE IF NOT EXISTS flight_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  flight_date date NOT NULL,
  location text NOT NULL,
  airport_code text,
  launch_field_id uuid,
  duration_minutes integer DEFAULT 0,
  max_altitude_feet integer DEFAULT 0,
  weather_conditions jsonb DEFAULT '{}'::jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create launch_fields table
CREATE TABLE IF NOT EXISTS launch_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  latitude decimal(10, 7) NOT NULL,
  longitude decimal(10, 7) NOT NULL,
  elevation_feet integer DEFAULT 0,
  airport_code text,
  restrictions text,
  facilities text[] DEFAULT ARRAY[]::text[],
  contact_info text,
  is_public boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key for launch_field_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'flight_logs_launch_field_id_fkey'
  ) THEN
    ALTER TABLE flight_logs
    ADD CONSTRAINT flight_logs_launch_field_id_fkey
    FOREIGN KEY (launch_field_id) REFERENCES launch_fields(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_flight_logs_user_id ON flight_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_flight_logs_flight_date ON flight_logs(flight_date);
CREATE INDEX IF NOT EXISTS idx_flight_logs_airport_code ON flight_logs(airport_code);
CREATE INDEX IF NOT EXISTS idx_launch_fields_location ON launch_fields(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_launch_fields_is_public ON launch_fields(is_public);
CREATE INDEX IF NOT EXISTS idx_launch_fields_created_by ON launch_fields(created_by);

-- Enable RLS
ALTER TABLE flight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_fields ENABLE ROW LEVEL SECURITY;

-- Flight Logs Policies
CREATE POLICY "Users can view own flight logs"
  ON flight_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own flight logs"
  ON flight_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flight logs"
  ON flight_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own flight logs"
  ON flight_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Launch Fields Policies
CREATE POLICY "Anyone can view public launch fields"
  ON launch_fields FOR SELECT
  TO authenticated
  USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Authenticated users can create launch fields"
  ON launch_fields FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own launch fields"
  ON launch_fields FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own launch fields"
  ON launch_fields FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_flight_logs_updated_at ON flight_logs;
CREATE TRIGGER update_flight_logs_updated_at
  BEFORE UPDATE ON flight_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_launch_fields_updated_at ON launch_fields;
CREATE TRIGGER update_launch_fields_updated_at
  BEFORE UPDATE ON launch_fields
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
