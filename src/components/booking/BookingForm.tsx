"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingSchema, BookingSchemaType } from "@/lib/validations/booking";
import { formatPhone } from "@/lib/utils/timeSlots";
import { siteConfig } from "@/config/site";

interface BookingFormProps {
  date: string;
  timeSlot: string;
  onSubmit: (data: BookingSchemaType) => void;
  isSubmitting: boolean;
}

export default function BookingForm({
  date,
  timeSlot,
  onSubmit,
  isSubmitting,
}: BookingFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingSchemaType>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { date, time_slot: timeSlot, party_size: 1 },
  });

  const phone = watch("phone");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">예약 정보</p>
        <p>날짜: {date}</p>
        <p>시간: {timeSlot}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          이름 <span className="text-red-500">*</span>
        </label>
        <input
          {...register("name")}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="홍길동"
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          연락처 <span className="text-red-500">*</span>
        </label>
        <input
          value={phone || ""}
          onChange={(e) => setValue("phone", formatPhone(e.target.value), { shouldValidate: true })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="010-1234-5678"
          maxLength={13}
        />
        {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          이메일 <span className="text-gray-400 text-xs">(선택)</span>
        </label>
        <input
          {...register("email")}
          type="email"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="example@email.com"
        />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          인원수 <span className="text-red-500">*</span>
        </label>
        <select
          {...register("party_size", { valueAsNumber: true })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Array.from({ length: siteConfig.business.maxPartySize }).map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}명
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          요청사항 <span className="text-gray-400 text-xs">(선택)</span>
        </label>
        <textarea
          {...register("notes")}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="특별 요청사항을 입력해주세요"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "예약 중..." : "예약 확정하기"}
      </button>
    </form>
  );
}
