-- ============================================================================
-- DESTRUCTIVE: removes the demo/test accounts seeded by the legacy scripts.
--
-- Those accounts were created with the password "password123", which is
-- committed to this repository (and its git history) in plain text — anyone
-- who can read the repo can log in as them. Run this against any database
-- where the seed scripts were ever executed, BEFORE going to production.
--
-- Deleting from auth.users cascades to profiles, cook_details, dishes,
-- menus, and bookings via the ON DELETE CASCADE foreign keys.
-- ============================================================================

DELETE FROM auth.users
WHERE email IN (
    'fatma@test.com',
    'amira@test.com',
    'leila@test.com',
    'hiba@test.com',
    'mohamed@test.com',
    'nadia@test.com',
    'selim@test.com',
    'tarek@test.com',
    'yousra@test.com',
    'hiba@demo.com',
    'mohamed@demo.com',
    'nadia@demo.com',
    'selim@demo.com'
);
