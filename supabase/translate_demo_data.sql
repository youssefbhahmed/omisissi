-- ============================================================================
-- TRADUCTION DES DONNÉES DE DÉMO EN FRANÇAIS
-- À exécuter une fois dans l'éditeur SQL Supabase (sans danger si relancé).
-- Traduit les bios, spécialités, descriptions de plats et menus des trois
-- cuisinières de démo. Ne touche pas aux comptes réels.
-- ============================================================================

-- Bios des cuisinières de démo
UPDATE public.cook_details SET
    bio = 'Avec 12 ans d''expérience à cuisiner pour de grandes familles à La Marsa, je suis spécialisée dans les plats tunisiens authentiques. Mes signatures : un riche couscous au poisson et le brik fait maison.',
    specialties = ARRAY['Traditionnel', 'Fruits de mer', 'Couscous']
WHERE id = (SELECT id FROM auth.users WHERE email = 'fatma@foodie-demo.com');

UPDATE public.cook_details SET
    bio = 'Je propose une version moderne et saine des classiques tunisiens. Végane ou plus léger ? Je suis votre cheffe ! Spécialiste de la slata mechouia fumée et du couscous végane.',
    specialties = ARRAY['Végane', 'Sain']
WHERE id = (SELECT id FROM auth.users WHERE email = 'amira@foodie-demo.com');

UPDATE public.cook_details SET
    bio = 'Spécialisée dans les pâtisseries tunisiennes traditionnelles, du makroudh au miel aux délicats gâteaux aux amandes. Parfait pour les goûters et les célébrations.',
    specialties = ARRAY['Pâtisseries', 'Boulangerie']
WHERE id = (SELECT id FROM auth.users WHERE email = 'leila@foodie-demo.com');

-- Spécialités des autres comptes existants (mapping anglais → français)
UPDATE public.cook_details SET specialties = (
    SELECT ARRAY(
        SELECT CASE s
            WHEN 'Traditional'  THEN 'Traditionnel'
            WHEN 'Vegan'        THEN 'Végane'
            WHEN 'Pastries'     THEN 'Pâtisseries'
            WHEN 'Healthy'      THEN 'Sain'
            WHEN 'Comfort Food' THEN 'Plats réconfortants'
            WHEN 'Seafood'      THEN 'Fruits de mer'
            WHEN 'Baking'       THEN 'Boulangerie'
            ELSE s
        END
        FROM unnest(specialties) AS s
    )
) WHERE specialties IS NOT NULL;

-- Descriptions des plats de démo (les noms de plats tunisiens restent)
UPDATE public.dishes SET description = 'Couscous cuit à la vapeur avec mérou frais, pois chiches et un riche bouillon relevé à la harissa.'
WHERE name = 'Couscous au Poisson';

UPDATE public.dishes SET name = 'Brik traditionnel', description = 'Feuille de malsouka croustillante garnie de thon, œuf, câpres et persil — frite à la commande.'
WHERE name = 'Traditional Brik';

UPDATE public.dishes SET description = 'Salade fumée de poivrons et tomates grillés, huile d''olive, ail et une pointe de carvi.'
WHERE name = 'Slata Mechouia' AND description LIKE 'Smoky%';

UPDATE public.dishes SET description = 'Ma version plus légère du classique : légumes grillés, extra citron, sans pain.'
WHERE name = 'Slata Mechouia' AND description LIKE 'My lighter%';

UPDATE public.dishes SET name = 'Plateau festin familial', description = 'Un généreux assortiment de viandes grillées, légumes de saison et accompagnements maison pour toute la tablée.'
WHERE name = 'Family Feast Platter';

UPDATE public.dishes SET name = 'Couscous végane', description = 'Couscous gorgé de légumes avec potiron rôti, pois chiches et raisins secs — 100 % végétal.'
WHERE name = 'Vegan Couscous';

UPDATE public.dishes SET description = 'Œufs pochés dans une sauce tomate-poivrons longuement mijotée, herbes fraîches en finition.'
WHERE name = 'Shakshuka';

UPDATE public.dishes SET name = 'Brik fromage & herbes', description = 'Un brik végétarien au fromage frais, menthe et œuf dans une feuille ultra-fine et croustillante.'
WHERE name = 'Cheese & Herb Brik';

UPDATE public.dishes SET description = 'Losanges de semoule fourrés à la pâte de dattes, frits et trempés dans un miel à la fleur d''oranger.'
WHERE name = 'Makroudh';

UPDATE public.dishes SET name = 'Assortiment de gâteaux aux amandes', description = 'Kaak warka, baklawa et croissants aux amandes — faits pour les célébrations.'
WHERE name = 'Almond Sweets Assortment';

-- Menus de démo
UPDATE public.menus SET name = 'Dîner traditionnel 3 services', description = 'Brik en entrée, mechouia fumée en accompagnement, et mon couscous au poisson signature.'
WHERE name = '3-Course Traditional Dinner';

UPDATE public.menus SET name = 'Festin de la mer', description = 'L''expérience La Marsa complète : couscous au poisson et plateau festin familial.'
WHERE name = 'Seafood Feast';

UPDATE public.menus SET name = 'Dîner familial sain', description = 'Mechouia, shakshuka et couscous végane — léger, frais et copieux.'
WHERE name = 'Healthy Family Dinner';

UPDATE public.menus SET name = 'Coffret pâtisseries pour le thé', description = 'Makroudh et assortiment de gâteaux aux amandes, dressés pour votre réception.'
WHERE name = 'Tea Party Pastry Box';

-- Vérification : tout doit s'afficher en français
SELECT name, LEFT(description, 60) AS description FROM public.dishes ORDER BY name;
