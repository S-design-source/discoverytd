"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { modelScheduleSchema, ModelScheduleSchemaType } from "@/lib/validations/schedule";

interface Props {
  defaultValues?: Partial<ModelScheduleSchemaType>;
  onSubmit: (data: ModelScheduleSchemaType) => void;
  isSubmitting: boolean;
  submitLabel: string;
}

export default function ModelScheduleForm({ defaultValues, onSubmit, isSubmitting, submitLabel }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<ModelScheduleSchemaType>({
    resolver: zodResolver(modelScheduleSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
        <input
          type="date"
          {...register("date")}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">시작 시간</label>
          <input
            type="time"
            {...register("start_time")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          {errors.start_time && <p className="text-xs text-red-500 mt-1">{errors.start_time.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">종료 시간</label>
          <input
            type="time"
            {...register("end_time")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          {errors.end_time && <p className="text-xs text-red-500 mt-1">{errors.end_time.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">내용 (선택)</label>
        <textarea
          {...register("content")}
          rows={3}
          placeholder="피팅 내용을 입력해주세요"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
        />
        {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-pink-600 text-white rounded-xl py-3 font-semibold text-sm hover:bg-pink-700 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? "저장 중..." : submitLabel}
      </button>
    </form>
  );
}
