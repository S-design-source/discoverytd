-- =============================================
-- 1. 기존 테이블 제거
-- =============================================
DROP TABLE IF EXISTS bookings CASCADE;

-- =============================================
-- 2. profiles (역할 구분)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('admin', 'company')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- 신규 유저 생성 시 profiles 자동 삽입 트리거
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'company')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- 3. companies (업체 정보)
-- =============================================
CREATE TABLE IF NOT EXISTS companies (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  company_code TEXT UNIQUE NOT NULL,
  color        TEXT DEFAULT '#6366f1',
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- 관리자: 전체 조회
CREATE POLICY "companies_select_admin"
  ON companies FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- 업체: 본인 행만 조회
CREATE POLICY "companies_select_own"
  ON companies FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- 관리자만 INSERT/UPDATE/DELETE
CREATE POLICY "companies_insert_admin"
  ON companies FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "companies_update_admin"
  ON companies FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "companies_delete_admin"
  ON companies FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- =============================================
-- 4. sample_schedules (샘플접수 스케줄)
-- =============================================
CREATE TABLE IF NOT EXISTS sample_schedules (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  sample_code TEXT NOT NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sample_schedules_date       ON sample_schedules(date);
CREATE INDEX IF NOT EXISTS idx_sample_schedules_company    ON sample_schedules(company_id);
CREATE INDEX IF NOT EXISTS idx_sample_schedules_company_date ON sample_schedules(company_id, date);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sample_schedules_updated_at ON sample_schedules;
CREATE TRIGGER sample_schedules_updated_at
  BEFORE UPDATE ON sample_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE sample_schedules ENABLE ROW LEVEL SECURITY;

-- 관리자: 전체 조회
CREATE POLICY "schedules_select_admin"
  ON sample_schedules FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- 업체: 본인 것만 조회
CREATE POLICY "schedules_select_own"
  ON sample_schedules FOR SELECT TO authenticated
  USING (company_id = auth.uid());

-- 업체: 본인 것만 INSERT
CREATE POLICY "schedules_insert_own"
  ON sample_schedules FOR INSERT TO authenticated
  WITH CHECK (
    company_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'company'
    )
  );

-- 업체: 본인 것만 UPDATE
CREATE POLICY "schedules_update_own"
  ON sample_schedules FOR UPDATE TO authenticated
  USING (company_id = auth.uid())
  WITH CHECK (company_id = auth.uid());

-- 업체: 본인 것만 DELETE
CREATE POLICY "schedules_delete_own"
  ON sample_schedules FOR DELETE TO authenticated
  USING (company_id = auth.uid());

-- =============================================
-- 5. 관리자 계정 role 설정 (계정 생성 후 수동 실행)
-- =============================================
-- UPDATE profiles SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = '관리자이메일@example.com');
