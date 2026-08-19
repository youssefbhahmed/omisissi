-- Add a 'guests' column to the bookings table for the new pricing model
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS guests INTEGER DEFAULT 4;
