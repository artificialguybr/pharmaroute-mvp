-- =============================================
-- PharmaRoute Database Schema
-- Run this in your Supabase SQL editor
-- =============================================

-- 1. PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       text NOT NULL DEFAULT 'seller' CHECK (role IN ('manager', 'seller')),
  name       text NOT NULL,
  phone      text,
  avatar     text,   -- initials, e.g. 'AP'
  region     text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger: new user → profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'seller'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. PHARMACIES
CREATE TABLE IF NOT EXISTS pharmacies (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  address        text NOT NULL,
  lat            double precision NOT NULL,
  lng            double precision NOT NULL,
  phone          text DEFAULT '',
  email          text DEFAULT '',
  region         text NOT NULL DEFAULT 'Geral',
  notes          text DEFAULT '',
  contact_person text DEFAULT '',
  status         text NOT NULL DEFAULT 'needs_visit' CHECK (status IN ('needs_visit','visited_recently','scheduled')),
  last_visit     timestamptz,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

-- 3. VISITS
CREATE TABLE IF NOT EXISTS visits (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id        uuid NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
  seller_id          uuid NOT NULL REFERENCES profiles(id),
  date               timestamptz NOT NULL DEFAULT now(),
  notes              text DEFAULT '',
  status             text NOT NULL DEFAULT 'completed' CHECK (status IN ('completed','issue','rescheduled')),
  products_presented text,
  next_steps         text,
  created_at         timestamptz DEFAULT now()
);

-- Trigger: after insert visit → update pharmacy last_visit + status
CREATE OR REPLACE FUNCTION update_pharmacy_after_visit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE pharmacies SET
    last_visit = NEW.date,
    status = CASE
      WHEN NEW.status = 'completed' THEN 'visited_recently'
      WHEN NEW.status = 'issue' THEN 'needs_visit'
      ELSE status
    END,
    updated_at = now()
  WHERE id = NEW.pharmacy_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_visit_inserted ON visits;
CREATE TRIGGER on_visit_inserted
  AFTER INSERT ON visits
  FOR EACH ROW EXECUTE FUNCTION update_pharmacy_after_visit();

-- 4. SCHEDULES
CREATE TABLE IF NOT EXISTS schedules (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id   uuid NOT NULL REFERENCES profiles(id),
  pharmacy_id uuid NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
  date        timestamptz NOT NULL,
  notes       text DEFAULT '',
  status      text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','cancelled')),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- Trigger: schedule created → set pharmacy status to 'scheduled'
CREATE OR REPLACE FUNCTION update_pharmacy_on_schedule()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE pharmacies SET status = 'scheduled', updated_at = now()
  WHERE id = NEW.pharmacy_id AND status = 'needs_visit';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_schedule_inserted ON schedules;
CREATE TRIGGER on_schedule_inserted
  AFTER INSERT ON schedules
  FOR EACH ROW EXECUTE FUNCTION update_pharmacy_on_schedule();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits     ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules  ENABLE ROW LEVEL SECURITY;

-- profiles: own row + managers read all
CREATE POLICY "profiles_self_rw" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "profiles_manager_read" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'manager')
);

-- pharmacies: all authenticated can read; managers can write
CREATE POLICY "pharmacies_read" ON pharmacies FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "pharmacies_manager_write" ON pharmacies FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'manager')
);

-- visits: sellers insert own; all auth can read
CREATE POLICY "visits_read" ON visits FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "visits_seller_insert" ON visits FOR INSERT WITH CHECK (seller_id = auth.uid());

-- schedules: sellers read own; managers read/write all
CREATE POLICY "schedules_seller_read" ON schedules FOR SELECT USING (
  seller_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'manager')
);
CREATE POLICY "schedules_manager_write" ON schedules FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'manager')
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_pharmacies_region ON pharmacies(region);
CREATE INDEX IF NOT EXISTS idx_pharmacies_status ON pharmacies(status);
CREATE INDEX IF NOT EXISTS idx_pharmacies_location ON pharmacies(lat, lng);
CREATE INDEX IF NOT EXISTS idx_visits_pharmacy ON visits(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_visits_seller ON visits(seller_id);
CREATE INDEX IF NOT EXISTS idx_schedules_seller_date ON schedules(seller_id, date);
