import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export default async function CompletePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  let booking = null;

  if (id) {
    const supabase = await createAdminClient();
    const { data } = await supabase
      .from("bookings")
      .select("id, date, time_slot, name, phone, party_size")
      .eq("id", id)
      .single();
    booking = data;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 shadow-sm max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-2">예약이 완료되었습니다!</h1>
        <p className="text-sm text-gray-500 mb-6">
          예약 확인 후 연락드리겠습니다.
        </p>

        {booking && (
          <div className="bg-gray-50 rounded-xl p-4 text-left text-sm space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-500">예약번호</span>
              <span className="font-mono font-semibold">{booking.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">날짜</span>
              <span>{booking.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">시간</span>
              <span>{String(booking.time_slot).slice(0, 5)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">예약자</span>
              <span>{booking.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">인원</span>
              <span>{booking.party_size}명</span>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 mb-6">
          예약 수정/취소는 {siteConfig.contact.phone}으로 문의해 주세요.
        </p>

        <Link
          href="/"
          className="block w-full bg-blue-600 text-white rounded-xl py-3 font-semibold text-sm hover:bg-blue-700 transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
