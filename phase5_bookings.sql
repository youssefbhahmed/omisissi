-- ==============================================================================
-- Foodie IV: Phase 5 - Booking & Scheduling Schema
-- ==============================================================================

-- 1. Create the Bookings Table
CREATE TABLE bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    family_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    cook_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    menu_id UUID REFERENCES menus(id) ON DELETE SET NULL, -- Optional: if they booked a Set Menu
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'in_progress', 'completed', 'cancelled')),
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    duration_hours NUMERIC NOT NULL DEFAULT 2.0, -- Default duration
    location TEXT NOT NULL CHECK (location IN ('client_home', 'cook_home')),
    address TEXT, -- The delivery/cooking address if client_home
    total_price NUMERIC NOT NULL,
    grocery_delivery BOOLEAN DEFAULT false,
    notes TEXT, -- For custom dish requests or dietary notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Families can view their own bookings
CREATE POLICY "Families can view their own bookings" 
    ON bookings FOR SELECT 
    USING (auth.uid() = family_id);

-- Cooks can view bookings assigned to them
CREATE POLICY "Cooks can view their own bookings" 
    ON bookings FOR SELECT 
    USING (auth.uid() = cook_id);

-- Families can create bookings
CREATE POLICY "Families can insert bookings" 
    ON bookings FOR INSERT 
    WITH CHECK (auth.uid() = family_id);

-- Families can update their bookings (e.g., cancel) if pending
CREATE POLICY "Families can update their pending bookings" 
    ON bookings FOR UPDATE 
    USING (auth.uid() = family_id)
    WITH CHECK (auth.uid() = family_id AND status IN ('pending', 'cancelled'));

-- Cooks can update bookings assigned to them (e.g., accept/decline/complete)
CREATE POLICY "Cooks can update bookings assigned to them" 
    ON bookings FOR UPDATE 
    USING (auth.uid() = cook_id)
    WITH CHECK (auth.uid() = cook_id);


-- 2. Create Junction Table for A La Carte Booking Items
-- This handles when a family books individual dishes instead of a Set Menu
CREATE TABLE booking_dishes (
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    dish_id UUID REFERENCES dishes(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    PRIMARY KEY (booking_id, dish_id)
);

-- Enable RLS for booking_dishes
ALTER TABLE booking_dishes ENABLE ROW LEVEL SECURITY;

-- Families can view their booking dishes
CREATE POLICY "Families can view their own booking dishes" 
    ON booking_dishes FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM bookings 
            WHERE bookings.id = booking_dishes.booking_id 
            AND bookings.family_id = auth.uid()
        )
    );

-- Cooks can view dishes for their bookings
CREATE POLICY "Cooks can view dishes for their bookings" 
    ON booking_dishes FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM bookings 
            WHERE bookings.id = booking_dishes.booking_id 
            AND bookings.cook_id = auth.uid()
        )
    );

-- Families can insert booking dishes for their own bookings
CREATE POLICY "Families can insert booking dishes" 
    ON booking_dishes FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM bookings 
            WHERE bookings.id = booking_dishes.booking_id 
            AND bookings.family_id = auth.uid()
        )
    );


-- 3. Modify existing cook_details table for availability
ALTER TABLE cook_details ADD COLUMN IF NOT EXISTS available_days JSONB DEFAULT '[]'::jsonb;


-- Trigger for updated_at on bookings
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bookings_modtime
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
