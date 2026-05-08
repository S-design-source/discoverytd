"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import DatePicker from "@/components/booking/DatePicker";
import TimeSlotPicker from "@/components/booking/TimeSlotPicker";
import BookingForm from "@/components/booking/BookingForm";
import { generateTimeSlots } from "@/lib/utils/timeSlots";
import { TimeSlot } from "@/types";
import { BookingSchemaType } from "@/lib/validations/booking";
import { siteConfig } from "@/config/site";
import Link from "next/link";

const STEPS = ["날짜 선택", "시간 선택", "정보 입력"];

export default function BookingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    setLoadingSlots(true);
    setSelectedTime("");

    fetch(`/api/bookings?date=${dateStr}`)
      .then((r) => r.json())
      .then((data: { time_slot: string; status: string }[]) => {
        const booked = (Array.isArray(data) ? data : [])
          .filter((b) => b.status !== "cancelled")
          .map((b) => b.time_slot.slice(0, 5));
        setSlots(generateTimeSlots(booked));
      })
      .catch(() => setSlots(generateTimeSlots()))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate]);

  const handleSubmit = async (formData: BookingSchemaType) => {
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "예약에 실패했습니다.");
        return;
      }
      router.push(`/booking/complete?id=${json.id}`);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-4 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-gray-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="font-bold text-lg">{siteConfig.name} 예약</h1>
      </header>

      {/* 스텝 인디케이터 */}
      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div
                className={[
                  "w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center",
                  i < step ? "bg-blue-600 text-white" : i === step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500",
                ].join(" ")}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-xs font-medium ${i === step ? "text-blue-600" : "text-gray-400"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="flex-1 h-0.5 bg-gray-200 ml-1" />}
            </div>
          ))}
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Step 0: 날짜 선택 */}
        {step === 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg mb-5">날짜를 선택해주세요</h2>
            <DatePicker
              selected={selectedDate}
              onSelect={(d) => { setSelectedDate(d); }}
            />
            <button
              disabled={!selectedDate}
              onClick={() => setStep(1)}
              className="mt-6 w-full bg-blue-600 text-white rounded-xl py-3 font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        )}

        {/* Step 1: 시간 선택 */}
        {step === 1 && selectedDate && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg mb-1">시간을 선택해주세요</h2>
            <p className="text-sm text-gray-500 mb-5">
              {format(selectedDate, "M월 d일 (EEE)", { locale: ko })}
            </p>
            <TimeSlotPicker
              slots={slots}
              selected={selectedTime}
              onSelect={setSelectedTime}
              loading={loadingSlots}
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(0)}
                className="flex-1 border border-gray-300 text-gray-700 rounded-xl py-3 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                이전
              </button>
              <button
                disabled={!selectedTime}
                onClick={() => setStep(2)}
                className="flex-1 bg-blue-600 text-white rounded-xl py-3 font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 정보 입력 */}
        {step === 2 && selectedDate && selectedTime && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg mb-5">예약자 정보를 입력해주세요</h2>
            {error && (
              <div className="mb-4 bg-red-50 text-red-700 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}
            <BookingForm
              date={format(selectedDate, "yyyy-MM-dd")}
              timeSlot={selectedTime}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
            <button
              onClick={() => { setStep(1); setError(""); }}
              className="mt-3 w-full text-sm text-gray-500 hover:text-gray-700 py-2"
            >
              이전으로
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
