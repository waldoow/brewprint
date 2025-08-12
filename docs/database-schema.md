# Brewprints Database Schema Documentation

## Overview

This document defines the complete database schema for **Brewprints**, a coffee brewing assistant app. The schema is designed for **Supabase** (PostgreSQL) with Row Level Security (RLS) and uses UUID primary keys throughout.

## Core Principles

- **User Isolation**: All data is scoped to users via `user_id` foreign keys
- **UUID Primary Keys**: All tables use `gen_random_uuid()` for primary keys
- **Supabase Integration**: Uses `auth.users.id` for user references
- **JSONB for Flexibility**: Complex nested data stored as JSONB
- **Normalization**: Proper foreign key relationships with cascade deletes
- **Snake Case**: PostgreSQL naming conventions (snake_case)

---

## Entity Relationship Overview

```
users (auth.users)
├── profiles (1:1)
├── beans (1:many)
├── grinders (1:many)
├── brewers (1:many)
├── brewprints (1:many)
├── brewing_sessions (1:many)
├── water_profiles (1:many)
├── folders (1:many)
└── tags (1:many)

brewprints
├── brewing_sessions (1:many)
├── beans (many:1, optional)
├── grinders (many:1, optional)
├── brewers (many:1, optional)
└── parent brewprint (many:1, optional for versioning)

folders ↔ brewprints (many:many via folder_brewprints)
brewing_sessions → water_profiles (many:1, optional)
```

---

## Table Definitions

### 1. Profiles

Extends Supabase auth.users with app-specific user preferences.

```sql
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
```

**Unit Preferences Structure:**

```typescript
{
  temperature: 'celsius' | 'fahrenheit',
  weight: 'grams' | 'ounces',
  volume: 'ml' | 'floz',
  time_format: '12h' | '24h'
}
```

### 2. Beans

Coffee bean inventory with freshness tracking and tasting notes.

```sql
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
```

**Freshness Calculation Logic:**

- Days 0-2: too-fresh (level 2)
- Days 3-7: peak (level 5)
- Days 8-14: good (level 4)
- Days 15-21: declining (level 3)
- Days 22+: stale (level 1)

### 3. Grinders

Coffee grinder profiles with settings and maintenance tracking.

```sql
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
  microns_per_step integer, -- Optional: microns movement per adjustment

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
  cleaning_frequency integer, -- days

  -- Usage tracking
  total_uses integer DEFAULT 0,
  last_used timestamptz,

  notes text,
  is_default boolean DEFAULT false,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Settings JSONB Structure:**

```typescript
[
  {
    setting_number: number,
    description: string, // "V60 Light Roast"
    method: string, // "V60"
    bean_type: string, // "Light Ethiopian"
    notes: string,
  },
];
```

### 4. Brewers

Brewing equipment with method-specific specifications.

```sql
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
```

**Espresso Specs JSONB Structure:**

```typescript
{
  boiler_type?: 'single' | 'dual' | 'heat-exchanger',
  max_pressure?: number,      // bars
  pid_control?: boolean,
  pre_infusion?: boolean,
  group_heads?: integer,
  water_reservoir?: integer,  // ml
  pump_type?: 'vibratory' | 'rotary',
  portafilter_size?: number   // mm (58, 54, 53, etc.)
}
```

### 5. Water Profiles

Water chemistry profiles for advanced brewing metrics.

```sql
CREATE TABLE water_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Basic Info
  name text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN (
    'tap', 'filtered', 'bottled', 'distilled', 'custom'
  )),
  brand text, -- if bottled water

  -- Water Chemistry
  tds integer NOT NULL, -- Total Dissolved Solids (ppm)
  ph decimal(3,1),
  hardness integer, -- ppm (CaCO3 equivalent)

  -- Mineral content (key for extraction)
  mineral_content jsonb,

  is_default boolean DEFAULT false,
  notes text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Mineral Content JSONB Structure:**

```typescript
{
  calcium?: number,      // mg/L
  magnesium?: number,    // mg/L
  sodium?: number,       // mg/L
  chloride?: number,     // mg/L
  sulfate?: number,      // mg/L
  bicarbonate?: number   // mg/L
}
```

### 6. Brewprints

Recipe templates with brewing parameters and target metrics.

```sql
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

  -- Equipment References (optional - can be generic templates)
  bean_id uuid REFERENCES beans(id) ON DELETE SET NULL,
  grinder_id uuid REFERENCES grinders(id) ON DELETE SET NULL,
  brewer_id uuid REFERENCES brewers(id) ON DELETE SET NULL,

  -- Core Parameters
  parameters jsonb NOT NULL,

  -- Target Metrics (what we're aiming for)
  target_metrics jsonb,

  -- Brewing Steps
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- Versioning (flexible tree structure)
  parent_id uuid REFERENCES brewprints(id) ON DELETE SET NULL,
  version text DEFAULT 'v1',
  version_notes text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Parameters JSONB Structure:**

```typescript
{
  coffee_grams: number,
  water_grams: number,
  ratio: string,           // "1:16"
  grind_setting?: number,
  water_temp: number,      // celsius
  total_time: number,      // seconds
  bloom_time?: number      // seconds
}
```

**Target Metrics JSONB Structure:**

```typescript
{
  target_tds?: number,          // % (e.g., 1.35)
  target_extraction?: number,   // % (e.g., 20)
  target_strength?: number,     // mg/ml (e.g., 11)
  target_volume?: number        // ml of final brew
}
```

**Steps JSONB Structure:**

```typescript
[
  {
    id: string,
    order: number,
    title: string, // "Bloom", "First Pour"
    description: string, // "Pour 50g water in circular motion"
    duration: number, // seconds
    water_amount: number, // grams for this step
    technique: string, // "circular", "center-pour", "agitate"
    temperature: number, // if different from main temp
  },
];
```

### 7. Brewing Sessions

Completed brewing sessions with actual results and metrics.

```sql
CREATE TABLE brewing_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  brewprint_id uuid REFERENCES brewprints(id) ON DELETE CASCADE NOT NULL,
  water_profile_id uuid REFERENCES water_profiles(id) ON DELETE SET NULL,

  -- Session Details (always completed)
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  actual_duration integer NOT NULL, -- seconds

  -- Actual Parameters Used
  actual_parameters jsonb NOT NULL,

  -- Step Tracking
  step_timings jsonb DEFAULT '[]'::jsonb,

  -- Results & Evaluation
  rating integer CHECK (rating >= 1 AND rating <= 5),
  feedback jsonb,
  notes text,

  -- Advanced Brewing Metrics (actual results)
  advanced_metrics jsonb,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Actual Parameters JSONB Structure:**

```typescript
{
  coffee_grams: number,
  water_grams: number,
  grind_setting?: number,
  water_temp: number,
  bloom_time?: number
}
```

**Feedback JSONB Structure:**

```typescript
{
  extraction?: 'under' | 'good' | 'over',
  strength?: 'weak' | 'good' | 'strong',
  flavor?: 'sour' | 'balanced' | 'bitter'
}
```

**Advanced Metrics JSONB Structure:**

```typescript
{
  tds?: number,                    // Total Dissolved Solids (%)
  extraction_yield?: number,       // Extraction rate (%)
  brew_strength?: number,          // mg/ml
  refractometer_reading?: number,
  final_volume?: number,           // ml of final brew
  water_retained?: number          // grams retained in grounds
}
```

**Step Timings JSONB Structure:**

```typescript
[
  {
    step_id: string, // matches brewprint step id
    start_time: number, // offset from session start (seconds)
    end_time: number,
    actual_water_amount: number,
    notes: string,
  },
];
```

### 8. Folders

Organization system for brewprints collections.

```sql
CREATE TABLE folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Basic Info
  name text NOT NULL,
  description text,
  color text, -- hex color for UI

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 9. Folder Brewprints (Junction Table)

Many-to-many relationship between folders and brewprints.

```sql
CREATE TABLE folder_brewprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id uuid REFERENCES folders(id) ON DELETE CASCADE NOT NULL,
  brewprint_id uuid REFERENCES brewprints(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),

  -- Prevent duplicates
  UNIQUE(folder_id, brewprint_id)
);
```

### 10. Tags

Tagging system for content organization.

```sql
CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text, -- hex color
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
```

---

## Indexes & Performance

### Required Indexes

```sql
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
```

---

## Row Level Security (RLS)

All tables must have RLS policies to ensure user data isolation:

```sql
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

-- Example RLS policy (apply pattern to all tables)
CREATE POLICY "Users can only access their own data" ON beans
  FOR ALL USING (auth.uid() = user_id);
```

---

## Triggers

### Auto-update timestamps

```sql
-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- (repeat for all tables)
```

### Bean freshness calculation

```sql
-- Function to calculate bean freshness
CREATE OR REPLACE FUNCTION calculate_bean_freshness()
RETURNS TRIGGER AS $$
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
$$ language 'plpgsql';

CREATE TRIGGER calculate_bean_freshness_trigger
    BEFORE INSERT OR UPDATE OF roast_date ON beans
    FOR EACH ROW EXECUTE FUNCTION calculate_bean_freshness();
```

---

## Implementation Notes

### For Claude Code Development

1. **User Context**: Always filter queries by `auth.uid()` or `user_id`
2. **JSONB Queries**: Use PostgreSQL JSONB operators (`->`, `->>`, `@>`, etc.)
3. **Validation**: Implement client-side validation matching database constraints
4. **Real-time**: Use Supabase subscriptions for live updates
5. **File Storage**: Use Supabase Storage for avatars and photos
6. **Type Safety**: Generate TypeScript types from Supabase schema

### Default Data Creation

When a user signs up, automatically create:

- Profile record
- Default "ALL" folder
- Default water profile (if applicable)

### Data Relationships

- Brewprints can exist without specific equipment (generic templates)
- Brewing sessions always reference a specific brewprint
- Folders organize brewprints only (beans/grinders stay in Library)
- Recipe versioning allows flexible parent-child relationships

This schema supports all core Brewprints functionality while maintaining data integrity, performance, and extensibility for future features.
