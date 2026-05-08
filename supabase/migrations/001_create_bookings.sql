-- 예약 테이블
CREATE TABLE IF NOT EXISTS bookings (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  date        DATE NOT NULL,
  time_slot   TIME NOT NULL,
  name        VARCHAR(50) NOT NULL,
  phone       VARCHAR(20) NOT NULL,
  email       VARCHAR(100),
  party_size  SMALLINT DEFAULT 1,
  notes       TEXT,
  status      VARCHAR(10) DEFAULT 'pending'
              CHECK (status IN ('pending', 'confirmed', 'cancelled'))
);

-- 동일 날짜+시간 중복 예약 방지 (취소된 건 제외)
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_date_time
  ON bookings(date, time_slot)
  WHERE status != 'cancelled';

-- RLS 활성화
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 익명 사용자: 예약 생성만 허용
CREATE POLICY "anon_insert"
  ON bookings FOR INSERT TO anon WITH CHECK (true);

-- 인증된 사용자(관리자): 전체 조회/수정 허용
CREATE POLICY "auth_select"
  ON bookings FOR SELECT TO authenticated USING (true);

CREATE POLICY "auth_update"
  ON bookings FOR UPDATE TO authenticated USING (true);

CREATE POLICY "auth_delete"
  ON bookings FOR DELETE TO authenticated USING (true);
