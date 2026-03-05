-- add_rls_policies.sql
-- ensure row level security is enabled and open for development

-- enable rls (idempotent)
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.add_ons ENABLE ROW LEVEL SECURITY;

-- create permissive policies (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='categories' AND policyname='allow_all') THEN
    CREATE POLICY allow_all ON public.categories FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='menu_items' AND policyname='allow_all') THEN
    CREATE POLICY allow_all ON public.menu_items FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='variations' AND policyname='allow_all') THEN
    CREATE POLICY allow_all ON public.variations FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='add_ons' AND policyname='allow_all') THEN
    CREATE POLICY allow_all ON public.add_ons FOR ALL USING (true);
  END IF;
END
$$ LANGUAGE plpgsql;
