-- URGENT FIX: Bean Freshness Trigger Error
-- 
-- ERROR: function pg_catalog.extract(unknown, integer) does not exist
-- ISSUE: EXTRACT(EPOCH FROM (CURRENT_DATE - NEW.roast_date)) has type casting problems
-- SOLUTION: Use direct date subtraction which returns integer days
--
-- Apply this fix to your Supabase database immediately:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Run this entire script
-- 3. Test bean creation again

-- Drop existing function and trigger
DROP TRIGGER IF EXISTS calculate_bean_freshness_trigger ON beans;
DROP FUNCTION IF EXISTS calculate_bean_freshness();

-- Create corrected function
CREATE OR REPLACE FUNCTION calculate_bean_freshness()
RETURNS TRIGGER AS $$
DECLARE
    days_old integer;
BEGIN
    -- Fix: Direct date subtraction returns number of days (no EXTRACT needed)
    days_old := CURRENT_DATE - NEW.roast_date::date;

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

-- Recreate trigger
CREATE TRIGGER calculate_bean_freshness_trigger
    BEFORE INSERT OR UPDATE OF roast_date ON beans
    FOR EACH ROW EXECUTE FUNCTION calculate_bean_freshness();

-- Test the fix with a sample bean (optional)
-- INSERT INTO beans (
--   user_id, name, origin, process, roast_level, 
--   purchase_date, roast_date, supplier, cost, 
--   total_grams, remaining_grams
-- ) VALUES (
--   auth.uid(), 'Test Bean', 'Test Origin', 'washed', 'medium',
--   CURRENT_DATE, CURRENT_DATE - 5, 'Test Supplier', 20.00,
--   250, 250
-- );
--
-- This should create a bean with freshness_status = 'peak' and freshness_level = 5