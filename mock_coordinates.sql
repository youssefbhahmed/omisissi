-- Update Cook 1: Fatma Ben Ali (La Marsa - ~16km from Tunis center)
UPDATE public.cook_details cd
SET 
    location = ST_SetSRID(ST_Point(10.3246, 36.8782), 4326)::geography,
    city = 'Tunis, La Marsa'
FROM public.profiles p
WHERE p.id = cd.id AND p.full_name = 'Fatma Ben Ali';

-- Update Cook 2: Amira Trabelsi (Ariana - ~8km from Tunis center)
UPDATE public.cook_details cd
SET 
    location = ST_SetSRID(ST_Point(10.1936, 36.8625), 4326)::geography,
    city = 'Ariana'
FROM public.profiles p
WHERE p.id = cd.id AND p.full_name = 'Amira Trabelsi';

-- Update Cook 3: Leila Mansouri (Sidi Bou Said - ~18km from Tunis center)
UPDATE public.cook_details cd
SET 
    location = ST_SetSRID(ST_Point(10.3402, 36.8695), 4326)::geography,
    city = 'Sidi Bou Said'
FROM public.profiles p
WHERE p.id = cd.id AND p.full_name = 'Leila Mansouri';

-- Update the mock family as well (Tunis center)
UPDATE public.profiles
SET location = 'POINT(10.1601 36.7909)'
WHERE role = 'family';
