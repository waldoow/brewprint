# Brewprints Database Schema Documentation

## Overview

This document defines the complete database schema for **Brewprints**, a coffee brewing experimentation app. The schema is designed for **Supabase** (PostgreSQL) with Row Level Security (RLS) and uses UUID primary keys throughout.

**Core Concept**: Each brewprint represents **one brewing experiment/test** with complete documentation of parameters, results, and evaluation. Users iterate through experiments until they perfect their recipes.

## Core Principles

- **User Isolation**: All data is scoped to users via `user_id` foreign keys
- **UUID Primary Keys**: All tables use `gen_random_uuid()` for primary keys
- **Supabase Integration**: Uses `auth.users.id` for user references
- **JSONB for Flexibility**: Complex nested data stored as JSONB
- **Normalization**: Proper foreign key relationships with cascade deletes
- **Snake Case**: PostgreSQL naming conventions (snake_case)
- **Experimentation Workflow**: Each brewprint = one brewing test with rating and notes

---

## Entity Relationship Overview

```
users (auth.users)
├── profiles (1:1)
├── beans (1:many)
├── grinders (1:many)
├── brewers (1:many)
├── brewprints (1:many) ← Core experimentation entity
├── water_profiles (1:many)
├── folders (1:many)
└── tags (1:many)

brewprints
├── beans (many:1, optional)
├── grinders (many:1, optional)
├── brewers (many:1, optional)
├── water_profiles (many:1, optional)
└── parent brewprint (many:1, optional for versioning)

folders ↔ brewprints (many:many via folder_brewprints)
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

Coffee brewing experiments with complete test documentation and results.

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
  water_profile_id uuid REFERENCES water_profiles(id) ON DELETE SET NULL,

  -- Target Parameters (what you plan to do)
  parameters jsonb NOT NULL,

  -- Target Metrics (what you're aiming for)
  target_metrics jsonb,

  -- Brewing Steps
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- Actual Brewing Results (what happened when you tested this)
  actual_parameters jsonb,       -- What you actually used
  actual_metrics jsonb,          -- What you measured (TDS, extraction, etc.)
  rating integer CHECK (rating >= 1 AND rating <= 5),
  tasting_notes text[],          -- ["fruity", "bright", "balanced"]
  brewing_notes text,            -- "Perfect! This is the sweet spot."
  brew_date timestamptz,         -- When you tested this experiment
  status text DEFAULT 'experimenting' CHECK (status IN ('experimenting', 'final', 'archived')),

  -- Versioning (flexible tree structure)
  parent_id uuid REFERENCES brewprints(id) ON DELETE SET NULL,
  version text DEFAULT 'v1',
  version_notes text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Core Concept**: Each brewprint represents ONE brewing experiment/test. Users create new brewprints for each iteration until they achieve the perfect recipe.

**Workflow Example**:

```
Ethiopian V60 Test #1 → status: 'experimenting', rating: 2, notes: "Too weak"
Ethiopian V60 Test #2 → status: 'experimenting', rating: 4, notes: "Better, but still acidic"
Ethiopian V60 Test #3 → status: 'final', rating: 5, notes: "PERFECT! This is the one."
```

**Actual Parameters JSONB Structure:**

```typescript
{
  coffee_grams: number,        // What you actually weighed
  water_grams: number,         // What you actually poured
  grind_setting?: number,      // Actual grinder setting used
  water_temp: number,          // Actual water temperature
  bloom_time?: number,         // Actual bloom duration
  total_time?: number          // How long it actually took
}
```

**Actual Metrics JSONB Structure:**

```typescript
{
  tds?: number,                    // Measured Total Dissolved Solids (%)
  extraction_yield?: number,       // Calculated extraction rate (%)
  brew_strength?: number,          // Measured strength (mg/ml)
  refractometer_reading?: number,  // Direct refractometer value
  final_volume?: number,           // ml of final brew
  water_retained?: number          // grams retained in coffee grounds
}
```

**Status Field Values:**

- `experimenting` (default): Still testing and iterating
- `final`: Recipe perfected, ready to brew consistently
- `archived`: Old experiments kept for reference

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

### 7. Folders

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

### 8. Folder Brewprints (Junction Table)

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

### 9. Tags

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
CREATE INDEX idx_water_profiles_user_id ON water_profiles(user_id);
CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_tags_user_id ON tags(user_id);

-- Foreign key relationships
CREATE INDEX idx_folder_brewprints_folder_id ON folder_brewprints(folder_id);
CREATE INDEX idx_folder_brewprints_brewprint_id ON folder_brewprints(brewprint_id);
CREATE INDEX idx_brewprints_parent_id ON brewprints(parent_id);
CREATE INDEX idx_brewprints_water_profile_id ON brewprints(water_profile_id);

-- Performance indexes
CREATE INDEX idx_beans_roast_date ON beans(user_id, roast_date);
CREATE INDEX idx_beans_freshness ON beans(user_id, freshness_status);
CREATE INDEX idx_brewprints_method ON brewprints(user_id, method);
CREATE INDEX idx_brewprints_status ON brewprints(user_id, status);
CREATE INDEX idx_brewprints_rating ON brewprints(user_id, rating DESC);
CREATE INDEX idx_brewprints_brew_date ON brewprints(user_id, brew_date DESC);
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

### Coffee Experimentation Workflow

**Core Pattern**: Each brewprint represents ONE brewing experiment

```typescript
// Creating a new experiment
const createExperiment = async (baseBrewprint, adjustments) => {
  const newBrewprint = {
    ...baseBrewprint,
    parent_id: baseBrewprint.id,
    version: getNextVersion(baseBrewprint.version),
    parameters: { ...baseBrewprint.parameters, ...adjustments },
    status: "experimenting",
    created_at: new Date(),
  };

  return await supabase.from("brewprints").insert(newBrewprint);
};

// After brewing and tasting
const recordResults = async (brewprintId, results) => {
  return await supabase
    .from("brewprints")
    .update({
      actual_parameters: results.actualParams,
      actual_metrics: results.metrics,
      rating: results.rating,
      tasting_notes: results.tastingNotes,
      brewing_notes: results.notes,
      brew_date: new Date(),
      status: results.rating >= 4 ? "final" : "experimenting",
    })
    .eq("id", brewprintId);
};
```

### Query Patterns

**Get user's final recipes:**

```sql
SELECT * FROM brewprints
WHERE user_id = auth.uid() AND status = 'final'
ORDER BY rating DESC, brew_date DESC;
```

**Get experimentation chain:**

```sql
WITH RECURSIVE experiment_chain AS (
  SELECT * FROM brewprints WHERE id = $parent_id
  UNION ALL
  SELECT b.* FROM brewprints b
  JOIN experiment_chain ec ON b.parent_id = ec.id
)
SELECT * FROM experiment_chain ORDER BY created_at;
```

**Find successful experiments by method:**

```sql
SELECT method, COUNT(*) as experiments, AVG(rating) as avg_rating
FROM brewprints
WHERE user_id = auth.uid() AND rating IS NOT NULL
GROUP BY method
ORDER BY avg_rating DESC;
```

### Default Data Creation

When a user signs up, automatically create:

- Profile record
- Default "ALL" folder
- Default water profile (if applicable)

### Data Relationships

- Brewprints can exist without specific equipment (generic experiments)
- Each brewprint represents a complete brewing test with results
- Folders organize brewprints only (beans/grinders stay in Library)
- Recipe versioning allows flexible parent-child experimentation chains
- Status field tracks experiment lifecycle: experimenting → final → archived

This schema supports the coffee experimentation workflow where users iterate through brewing tests, document results, and build a knowledge base of perfected recipes.
