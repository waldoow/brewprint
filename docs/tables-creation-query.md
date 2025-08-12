-- =====================================================
-- Brewprints Complete Database Setup for Supabase
-- =====================================================

-- Drop existing tables if they exist (careful in production!)
DROP TABLE IF EXISTS folder_brewprints CASCADE;
DROP TABLE IF EXISTS brewing_sessions CASCADE;
DROP TABLE IF EXISTS brewprints CASCADE;
DROP TABLE IF EXISTS water_profiles CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS folders CASCADE;
DROP TABLE IF EXISTS brewers CASCADE;
DROP TABLE IF EXISTS grinders CASCADE;
DROP TABLE IF EXISTS beans CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================
CREATE TABLE profiles (
id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
display_name text,
avatar_url text,
unit_preferences jsonb DEFAULT '{
"temperature": "celsius",
"weight": "grams",
"volume": "ml",
"time_format": "24h"
}'::jsonb,
created_at timestamptz DEFAULT now(),
updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 2. BEANS TABLE
-- =====================================================
CREATE TABLE beans (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

-- Basic Info
name text NOT NULL,
origin text NOT NULL,
farm text,
region text,
altitude integer,
process text NOT NULL CHECK (process IN (
'washed', 'natural', 'honey', 'pulped-natural', 'semi-washed',
'white-honey', 'yellow-honey', 'red-honey', 'black-honey',
'wet-hulled', 'anaerobic', 'carbonic-maceration',
'extended-fermentation', 'other'
)),
variety text,

-- Purchase & Inventory
purchase_date date NOT NULL,
roast_date date NOT NULL,
supplier text NOT NULL,
cost decimal(10,2) NOT NULL,
total_grams integer NOT NULL,
remaining_grams integer NOT NULL,

-- Tasting & Rating
roast_level text NOT NULL CHECK (roast_level IN (
'light', 'medium-light', 'medium', 'medium-dark', 'dark'
)),
tasting_notes text[] DEFAULT '{}',
official_description text,
my_notes text,
rating integer CHECK (rating >= 1 AND rating <= 5),

-- System calculated fields (updated via triggers)
freshness_level integer CHECK (freshness_level >= 1 AND freshness_level <= 5),
freshness_status text CHECK (freshness_status IN (
'too-fresh', 'peak', 'good', 'declining', 'stale'
)),

created_at timestamptz DEFAULT now(),
updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 3. GRINDERS TABLE
-- =====================================================
CREATE TABLE grinders (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

-- Basic Info
name text NOT NULL,
brand text NOT NULL,
model text NOT NULL,
type text NOT NULL CHECK (type IN ('electric', 'manual')),
burr_type text CHECK (burr_type IN ('conical', 'flat', 'ghost')),
burr_material text CHECK (burr_material IN ('steel', 'ceramic', 'titanium-coated')),
microns_per_step integer,

-- Settings & Configuration
settings jsonb DEFAULT '[]'::jsonb,
default_setting integer,
setting_range jsonb DEFAULT '{
"min": 1,
"max": 40,
"increment": 1
}'::jsonb,

-- Maintenance
last_cleaned date,
cleaning_frequency integer,

-- Usage tracking
total_uses integer DEFAULT 0,
last_used timestamptz,

notes text,
is_default boolean DEFAULT false,

created_at timestamptz DEFAULT now(),
updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 4. BREWERS TABLE
-- =====================================================
CREATE TABLE brewers (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

-- Basic Info
name text NOT NULL,
brand text NOT NULL,
model text NOT NULL,
type text NOT NULL CHECK (type IN (
'pour-over', 'immersion', 'espresso', 'cold-brew',
'siphon', 'percolator', 'turkish', 'moka'
)),

-- General Specifications (optional)
capacity_ml integer,
material text,
filter_type text,

-- Espresso-specific fields (only for espresso type)
espresso_specs jsonb,

notes text,

created_at timestamptz DEFAULT now(),
updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 5. WATER PROFILES TABLE
-- =====================================================
CREATE TABLE water_profiles (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

-- Basic Info
name text NOT NULL,
source_type text NOT NULL CHECK (source_type IN (
'tap', 'filtered', 'bottled', 'distilled', 'custom'
)),
brand text,

-- Water Chemistry
tds integer NOT NULL,
ph decimal(3,1),
hardness integer,

-- Mineral content
mineral_content jsonb,

is_default boolean DEFAULT false,
notes text,

created_at timestamptz DEFAULT now(),
updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 6. BREWPRINTS TABLE
-- =====================================================
CREATE TABLE brewprints (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

-- Basic Info
name text NOT NULL,
description text,
method text NOT NULL CHECK (method IN (
'v60', 'chemex', 'french-press', 'aeropress', 'espresso',
'cold-brew', 'siphon', 'percolator', 'turkish', 'moka'
)),
difficulty integer NOT NULL CHECK (difficulty >= 1 AND difficulty <= 3),

-- Equipment References (optional)
bean_id uuid REFERENCES beans(id) ON DELETE SET NULL,
grinder_id uuid REFERENCES grinders(id) ON DELETE SET NULL,
brewer_id uuid REFERENCES brewers(id) ON DELETE SET NULL,

-- Core Parameters
parameters jsonb NOT NULL,

-- Target Metrics
target_metrics jsonb,

-- Brewing Steps
steps jsonb NOT NULL DEFAULT '[]'::jsonb,

-- Versioning
parent_id uuid REFERENCES brewprints(id) ON DELETE SET NULL,
version text DEFAULT 'v1',
version_notes text,

created_at timestamptz DEFAULT now(),
updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 7. BREWING SESSIONS TABLE
-- =====================================================
CREATE TABLE brewing_sessions (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
brewprint_id uuid REFERENCES brewprints(id) ON DELETE CASCADE NOT NULL,
water_profile_id uuid REFERENCES water_profiles(id) ON DELETE SET NULL,

-- Session Details
start_time timestamptz NOT NULL,
end_time timestamptz NOT NULL,
actual_duration integer NOT NULL,

-- Actual Parameters Used
actual_parameters jsonb NOT NULL,

-- Step Tracking
step_timings jsonb DEFAULT '[]'::jsonb,

-- Results & Evaluation
rating integer CHECK (rating >= 1 AND rating <= 5),
feedback jsonb,
notes text,

-- Advanced Brewing Metrics
advanced_metrics jsonb,

created_at timestamptz DEFAULT now(),
updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 8. FOLDERS TABLE
-- =====================================================
CREATE TABLE folders (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

-- Basic Info
name text NOT NULL,
description text,
color text,

created_at timestamptz DEFAULT now(),
updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 9. FOLDER BREWPRINTS JUNCTION TABLE
-- =====================================================
CREATE TABLE folder_brewprints (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
folder_id uuid REFERENCES folders(id) ON DELETE CASCADE NOT NULL,
brewprint_id uuid REFERENCES brewprints(id) ON DELETE CASCADE NOT NULL,
created_at timestamptz DEFAULT now(),

-- Prevent duplicates
UNIQUE(folder_id, brewprint_id)
);

-- =====================================================
-- 10. TAGS TABLE
-- =====================================================
CREATE TABLE tags (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
name text NOT NULL,
color text,
category text CHECK (category IN (
'method', 'flavor', 'occasion', 'difficulty', 'custom'
)),
usage_count integer DEFAULT 0,
last_used timestamptz,

created_at timestamptz DEFAULT now(),
updated_at timestamptz DEFAULT now(),

-- Prevent duplicate tags per user
UNIQUE(user_id, name)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User data isolation (most important)
CREATE INDEX idx_beans_user_id ON beans(user_id);
CREATE INDEX idx_grinders_user_id ON grinders(user_id);
CREATE INDEX idx_brewers_user_id ON brewers(user_id);
CREATE INDEX idx_brewprints_user_id ON brewprints(user_id);
CREATE INDEX idx_brewing_sessions_user_id ON brewing_sessions(user_id);
CREATE INDEX idx_water_profiles_user_id ON water_profiles(user_id);
CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_tags_user_id ON tags(user_id);

-- Foreign key relationships
CREATE INDEX idx_brewing_sessions_brewprint_id ON brewing_sessions(brewprint_id);
CREATE INDEX idx_brewing_sessions_water_profile_id ON brewing_sessions(water_profile_id);
CREATE INDEX idx_folder_brewprints_folder_id ON folder_brewprints(folder_id);
CREATE INDEX idx_folder_brewprints_brewprint_id ON folder_brewprints(brewprint_id);
CREATE INDEX idx_brewprints_parent_id ON brewprints(parent_id);

-- Performance indexes
CREATE INDEX idx_beans_roast_date ON beans(user_id, roast_date);
CREATE INDEX idx_beans_freshness ON beans(user_id, freshness_status);
CREATE INDEX idx_brewing_sessions_start_time ON brewing_sessions(user_id, start_time DESC);
CREATE INDEX idx_brewprints_method ON brewprints(user_id, method);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;

$$
language 'plpgsql';

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beans_updated_at
    BEFORE UPDATE ON beans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grinders_updated_at
    BEFORE UPDATE ON grinders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brewers_updated_at
    BEFORE UPDATE ON brewers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_water_profiles_updated_at
    BEFORE UPDATE ON water_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brewprints_updated_at
    BEFORE UPDATE ON brewprints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brewing_sessions_updated_at
    BEFORE UPDATE ON brewing_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folders_updated_at
    BEFORE UPDATE ON folders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at
    BEFORE UPDATE ON tags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate bean freshness
CREATE OR REPLACE FUNCTION calculate_bean_freshness()
RETURNS TRIGGER AS
$$

DECLARE
days_old integer;
BEGIN
days_old := EXTRACT(EPOCH FROM (CURRENT_DATE - NEW.roast_date)) / 86400;

    CASE
        WHEN days_old < 2 THEN
            NEW.freshness_level := 2;
            NEW.freshness_status := 'too-fresh';
        WHEN days_old <= 7 THEN
            NEW.freshness_level := 5;
            NEW.freshness_status := 'peak';
        WHEN days_old <= 14 THEN
            NEW.freshness_level := 4;
            NEW.freshness_status := 'good';
        WHEN days_old <= 21 THEN
            NEW.freshness_level := 3;
            NEW.freshness_status := 'declining';
        ELSE
            NEW.freshness_level := 1;
            NEW.freshness_status := 'stale';
    END CASE;

    RETURN NEW;

END;

$$
language 'plpgsql';

-- Apply freshness calculation trigger
CREATE TRIGGER calculate_bean_freshness_trigger
    BEFORE INSERT OR UPDATE OF roast_date ON beans
    FOR EACH ROW EXECUTE FUNCTION calculate_bean_freshness();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) SETUP
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE beans ENABLE ROW LEVEL SECURITY;
ALTER TABLE grinders ENABLE ROW LEVEL SECURITY;
ALTER TABLE brewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brewprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE brewing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE folder_brewprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user data isolation

-- Profiles
CREATE POLICY "Users can manage their own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Beans
CREATE POLICY "Users can manage their own beans" ON beans
  FOR ALL USING (auth.uid() = user_id);

-- Grinders
CREATE POLICY "Users can manage their own grinders" ON grinders
  FOR ALL USING (auth.uid() = user_id);

-- Brewers
CREATE POLICY "Users can manage their own brewers" ON brewers
  FOR ALL USING (auth.uid() = user_id);

-- Water Profiles
CREATE POLICY "Users can manage their own water profiles" ON water_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Brewprints
CREATE POLICY "Users can manage their own brewprints" ON brewprints
  FOR ALL USING (auth.uid() = user_id);

-- Brewing Sessions
CREATE POLICY "Users can manage their own brewing sessions" ON brewing_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Folders
CREATE POLICY "Users can manage their own folders" ON folders
  FOR ALL USING (auth.uid() = user_id);

-- Folder Brewprints (needs special handling for junction table)
CREATE POLICY "Users can manage their folder brewprints" ON folder_brewprints
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM folders
      WHERE folders.id = folder_brewprints.folder_id
      AND folders.user_id = auth.uid()
    )
  );

-- Tags
CREATE POLICY "Users can manage their own tags" ON tags
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- INITIAL DATA SETUP
-- =====================================================

-- Function to create default folder for new users
CREATE OR REPLACE FUNCTION create_user_defaults()
RETURNS TRIGGER AS
$$

BEGIN
-- Create profile
INSERT INTO profiles (id, display_name)
VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Coffee Enthusiast'));

-- Create default "All" folder
INSERT INTO folders (user_id, name, description)
VALUES (NEW.id, 'All', 'All your brewprints');

RETURN NEW;
END;

$$
language 'plpgsql' SECURITY DEFINER;

-- Trigger to create defaults when user signs up
CREATE TRIGGER create_user_defaults_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_defaults();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant permissions on sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO
$$

BEGIN
RAISE NOTICE 'Brewprints database setup completed successfully!';
RAISE NOTICE 'Created tables: profiles, beans, grinders, brewers, water_profiles, brewprints, brewing_sessions, folders, folder_brewprints, tags';
RAISE NOTICE 'Applied RLS policies, triggers, and indexes';
RAISE NOTICE 'Ready for Brewprints app development!';
END $$;
