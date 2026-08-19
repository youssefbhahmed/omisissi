-- Add complexity level to dishes (1=easy, 2=medium, 3=hard, 4=expert)
ALTER TABLE public.dishes ADD COLUMN IF NOT EXISTS complexity INTEGER DEFAULT 2;

-- Update existing seed data with complexity levels
UPDATE public.dishes SET complexity = 1 WHERE name ILIKE '%salad%' OR name ILIKE '%slata%' OR name ILIKE '%mechouia%';
UPDATE public.dishes SET complexity = 2 WHERE name ILIKE '%brik%' OR name ILIKE '%shakshuka%';
UPDATE public.dishes SET complexity = 3 WHERE name ILIKE '%couscous%' OR name ILIKE '%feast%' OR name ILIKE '%platter%';
UPDATE public.dishes SET complexity = 4 WHERE name ILIKE '%pastries%' OR name ILIKE '%pastry%';
