import HeroSection from "@/components/landing/HeroSection";
import ServiceSection from "@/components/landing/ServiceSection";
import Footer from "@/components/landing/Footer";
import { siteConfig } from "@/config/site";
import Link from "next/link";

export default function Home() {
  const { openHour, closeHour } = siteConfig.business;
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />

      <ServiceSection />

      {/* 영업시간 & 예약 안내 */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">예약 방법</h2>
          <p className="text-gray-500 mb-8">
            아래 버튼을 눌러 날짜와 시간을 선택하고 간단한 정보를 입력하면 예약이 완료됩니다.
          </p>
          <div className="flex justify-center gap-4 flex-wrap mb-8">
            {["날짜 선택", "시간 선택", "정보 입력", "예약 완료"].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <span className="text-sm font-medium text-gray-700">{step}</span>
                {i < 3 && <span className="text-gray-300 text-lg">→</span>}
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-6 inline-block text-left mb-8 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-2">영업시간</p>
            <p className="text-sm text-gray-500">
              평일 {openHour}:00 ~ {closeHour}:00 / 일요일 휴무
            </p>
            <p className="text-sm text-gray-500 mt-1">
              문의: {siteConfig.contact.phone}
            </p>
          </div>
          <div className="block">
            <Link
              href="/booking"
              className="inline-block bg-blue-600 text-white font-bold px-10 py-4 rounded-2xl text-base hover:bg-blue-700 transition-colors"
            >
              예약하러 가기
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
