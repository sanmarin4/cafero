-- seed.sql
-- inserts default categories and any initial data used by the app

INSERT INTO public.categories (id, name, icon, sort_order)
VALUES
('dim-sum', 'Dim Sum', '🥟', 1),
('hot-coffee', 'Hot Coffee', '☕', 2),
('iced-coffee', 'Iced Coffee', '🧊', 3),
('specialty-drinks', 'Specialty Drinks', '🍹', 4),
('pastries', 'Pastries', '🥐', 5),
('sandwiches', 'Sandwiches', '🥪', 6)
ON CONFLICT (id) DO NOTHING;
