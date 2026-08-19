-- Add the missing 'address' column to the profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;

-- Also add a 'price_per_session' column to cook_details if missing
-- (needed by the search_cooks_by_location function)
ALTER TABLE public.cook_details ADD COLUMN IF NOT EXISTS price_per_session NUMERIC;
