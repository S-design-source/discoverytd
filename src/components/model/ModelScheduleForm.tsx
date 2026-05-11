"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { modelScheduleSchema, ModelScheduleSchemaType } from "@/lib/validations/schedule";

const TIME_OPTIONS: string[] = [];
for (let h = 0; h <= 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    if (h === 24 && m > 0) break;
    TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
}

function calcNetHours(start: string, end: string): { hours: number; lunchDeducted: number } | null {
  if (!start || !end) return null;
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const s = toMin(start);
  const e = toMin(end);
  if (e <= s) return null;
  const lunchOverlap = Math.max(0, Math.min(e, 780) - Math.max(s, 720)); // 720=12:00, 780=13:00
  return {
    hours: (e - s - lunchOverlap) / 60,
    lunchDeducted: lunchOverlap / 60,
  };
}

interface Props {
  defaultValues?: Partial<ModelScheduleSchemaType>;
  onSubmit: (data: ModelScheduleSchemaType) => void;
  isSubmitting: boolean;
  submitLabel: string;
}

export default function ModelScheduleForm({ defaultValues, onSubmit, isSubmitting, submitLabel }: Props) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ModelScheduleSchemaType>({
    resolver: zodResolver(modelScheduleSchema),
    defaultValues,
  });

  const startTime = watch("start_time");
  const endTime = watch("end_time");
  const netResult = calcNetHours(startTime, endTime);

  const selectClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white";

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
          <select {...register("start_time")} className={selectClass}>
            <option value="">선택</option>
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {errors.start_time && <p className="text-xs text-red-500 mt-1">{errors.start_time.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">종료 시간</label>
          <select {...register("end_time")} className={selectClass}>
            <option value="">선택</option>
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {errors.end_time && <p className="text-xs text-red-500 mt-1">{errors.end_time.message}</p>}
        </div>
      </div>

      {/* 실근무 시간 미리보기 */}
      {netResult !== null && (
        <div className={`rounded-lg px-4 py-2.5 text-sm font-medium flex items-center gap-2 ${
          netResult.lunchDeducted > 0
            ? "bg-orange-50 text-orange-700 border border-orange-200"
            : "bg-blue-50 text-blue-700 border border-blue-200"
        }`}>
          <span>⏱</span>
          <span>
            실근무: <strong>{netResult.hours % 1 === 0 ? netResult.hours : netResult.hours.toFixed(1)}시간</strong>
            {netResult.lunchDeducted > 0 && (
              <span className="ml-1 text-xs font-normal opacity-80">
                (점심 {netResult.lunchDeducted % 1 === 0 ? netResult.lunchDeducted : netResult.lunchDeducted.toFixed(1)}시간 공제)
              </span>
            )}
          </span>
        </div>
      )}
      {startTime && endTime && netResult === null && (
        <p className="text-xs text-red-500">종료 시간이 시작 시간보다 늦어야 합니다.</p>
      )}

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
