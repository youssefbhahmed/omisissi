-- 1. Enable PostGIS extension for geospatial operations
CREATE EXTENSION IF NOT EXISTS postgis schema extensions;

-- 2. Add Location Columns to Profiles and Cook Details
-- Using Geography(POINT) type for Earth curvature accuracy
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT);
ALTER TABLE public.cook_details ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT);

-- 3. Create Spatial Indexes for Fast Querying
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_cook_details_location ON public.cook_details USING GIST (location);

-- 4. Create RPC Function to Search Cooks by Location
-- Drop the function if it already exists to allow for easy updates
DROP FUNCTION IF EXISTS search_cooks_by_location(float, float, int);

CREATE OR REPLACE FUNCTION search_cooks_by_location(
    lat FLOAT, 
    lng FLOAT, 
    max_distance_meters INT DEFAULT 20000 -- Default to 20km radius
)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    specialties TEXT[],
    price_per_session NUMERIC,
    city TEXT,
    rating_average NUMERIC,
    total_reviews INT,
    distance_meters FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.avatar_url,
        cd.bio,
        cd.specialties,
        cd.price_per_session,
        cd.city,
        cd.rating_average,
        cd.total_reviews,
        -- Calculate distance in meters using ST_Distance
        ST_Distance(cd.location, ST_SetSRID(ST_Point(lng, lat), 4326)::geography) AS distance_meters
    FROM 
        public.profiles p
    JOIN 
        public.cook_details cd ON p.id = cd.id
    WHERE 
        p.role = 'cook'
        -- Optimize using ST_DWithin (uses the spatial index)
        AND ST_DWithin(
            cd.location, 
            ST_SetSRID(ST_Point(lng, lat), 4326)::geography, 
            max_distance_meters
        )
    ORDER BY 
        distance_meters ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
