-- Phase 4: Dishes and Menus Schema
-- This script creates the tables necessary for cooks to upload dishes and create set menus.

-- 1. Create the `dishes` table
CREATE TABLE IF NOT EXISTS public.dishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cook_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    category TEXT NOT NULL CHECK (category IN ('starter', 'main', 'dessert', 'side', 'other')),
    dietary_tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on dishes
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;

-- Dishes Policies
CREATE POLICY "Anyone can view dishes" 
ON public.dishes FOR SELECT 
USING (true);

CREATE POLICY "Cooks can insert their own dishes" 
ON public.dishes FOR INSERT 
WITH CHECK (auth.uid() = cook_id);

CREATE POLICY "Cooks can update their own dishes" 
ON public.dishes FOR UPDATE 
USING (auth.uid() = cook_id);

CREATE POLICY "Cooks can delete their own dishes" 
ON public.dishes FOR DELETE 
USING (auth.uid() = cook_id);


-- 2. Create the `menus` table (Packages/Set Menus)
CREATE TABLE IF NOT EXISTS public.menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cook_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on menus
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;

-- Menus Policies
CREATE POLICY "Anyone can view menus" 
ON public.menus FOR SELECT 
USING (true);

CREATE POLICY "Cooks can insert their own menus" 
ON public.menus FOR INSERT 
WITH CHECK (auth.uid() = cook_id);

CREATE POLICY "Cooks can update their own menus" 
ON public.menus FOR UPDATE 
USING (auth.uid() = cook_id);

CREATE POLICY "Cooks can delete their own menus" 
ON public.menus FOR DELETE 
USING (auth.uid() = cook_id);


-- 3. Create the `menu_dishes` junction table
CREATE TABLE IF NOT EXISTS public.menu_dishes (
    menu_id UUID NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
    dish_id UUID NOT NULL REFERENCES public.dishes(id) ON DELETE CASCADE,
    PRIMARY KEY (menu_id, dish_id)
);

-- Enable RLS on menu_dishes
ALTER TABLE public.menu_dishes ENABLE ROW LEVEL SECURITY;

-- Menu_Dishes Policies
CREATE POLICY "Anyone can view menu_dishes" 
ON public.menu_dishes FOR SELECT 
USING (true);

CREATE POLICY "Cooks can manage dishes in their menus" 
ON public.menu_dishes FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.menus
        WHERE menus.id = menu_dishes.menu_id
        AND menus.cook_id = auth.uid()
    )
);
