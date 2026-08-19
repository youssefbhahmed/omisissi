# Database setup

All SQL for the Foodie app lives here.

## Layout

| Path | What it is |
| --- | --- |
| `legacy/` | The original ad-hoc scripts, kept for reference. They were applied to the existing Supabase project in roughly this order: `phase4_dishes_menus.sql` → `storage_setup.sql` → `phase5_bookings.sql` → `add_guests_column.sql` → `add_dish_complexity.sql` → `fix_address_column.sql` → `fix_latlng_columns.sql` → `complete_geospatial_fix.sql` (+ optional seed scripts). ⚠️ `complete_geospatial_fix.sql` is not schema-only: besides the required `ALTER TABLE`s it also seeds three demo cook accounts with the publicly-committed password `password123`. |
| `migrations/` | New, ordered migrations. Run everything here against your project. |
| `cleanup_test_accounts.sql` | **Destructive.** Deletes the demo accounts seeded with the publicly-committed password `password123`. Run it before going to production. |

## Fresh project checklist

1. Create a Supabase project.
2. The `profiles` / `cook_details` base tables and the signup trigger (which
   reads `is_cook` from the signup metadata) predate this repo's scripts — if
   you are starting from scratch, create them first:

   ```sql
   CREATE TABLE public.profiles (
       id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
       full_name TEXT,
       avatar_url TEXT,
       role TEXT NOT NULL DEFAULT 'family' CHECK (role IN ('family', 'cook')),
       created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
   );

   CREATE TABLE public.cook_details (
       id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
       bio TEXT,
       specialties TEXT[] DEFAULT '{}',
       city TEXT
   );

   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS TRIGGER
   SECURITY DEFINER SET search_path = public
   AS $$
   BEGIN
       INSERT INTO public.profiles (id, full_name, role)
       VALUES (
           NEW.id,
           NEW.raw_user_meta_data ->> 'full_name',
           CASE WHEN (NEW.raw_user_meta_data ->> 'is_cook')::boolean THEN 'cook' ELSE 'family' END
       );
       IF (NEW.raw_user_meta_data ->> 'is_cook')::boolean THEN
           INSERT INTO public.cook_details (id) VALUES (NEW.id);
       END IF;
       RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER on_auth_user_created
       AFTER INSERT ON auth.users
       FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
   ```

3. Run the `legacy/` scripts in the order listed above (skip the seed and
   `mock_coordinates` scripts unless you want demo data). Note that
   `complete_geospatial_fix.sql` — which IS required for its `ALTER TABLE`
   statements — also seeds three demo cook accounts with the
   publicly-committed password `password123`. Either run only its
   `ALTER TABLE` / `DROP FUNCTION` section, or run the whole file and then
   `cleanup_test_accounts.sql`.
4. Run every file in `migrations/` in filename order. This is required — it
   contains the RLS policies and the storage-ownership fixes.
5. Before production: run `cleanup_test_accounts.sql` if any seed script was
   ever executed against this database.
