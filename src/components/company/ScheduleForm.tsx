"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { scheduleSchema, ScheduleSchemaType } from "@/lib/validations/schedule";
import { format } from "date-fns";

interface ScheduleFormProps {
  defaultValues?: Partial<ScheduleSchemaType>;
  onSubmit: (data: ScheduleSchemaType) => void;
  isSubmitting: boolean;
  submitLabel?: string;
}

export default function ScheduleForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel = "등록하기",
}: ScheduleFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScheduleSchemaType>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          날짜 <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          {...register("date")}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          샘플품번 <span className="text-red-500">*</span>
        </label>
        <input
          {...register("sample_code")}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="예: DT-2026-001"
        />
        {errors.sample_code && (
          <p className="mt-1 text-xs text-red-500">{errors.sample_code.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          내용 <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("content")}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="샘플 접수 관련 내용을 입력해주세요"
        />
        {errors.content && (
          <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "처리 중..." : submitLabel}
      </button>
    </form>
  );
}
