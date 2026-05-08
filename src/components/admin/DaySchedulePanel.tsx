import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { ScheduleWithCompany } from "@/types";

interface DaySchedulePanelProps {
  date: string;
  schedules: ScheduleWithCompany[];
}

export default function DaySchedulePanel({ date, schedules }: DaySchedulePanelProps) {
  const parsed = parseISO(date);
  const label = format(parsed, "M월 d일 (EEE)", { locale: ko });

  return (
    <div className="w-72 flex-shrink-0 bg-white rounded-2xl shadow-sm p-5 flex flex-col">
      <h3 className="font-bold text-base mb-4 text-gray-800">{label}</h3>

      {schedules.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400">등록된 스케줄이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto flex-1">
          {schedules.map((s) => (
            <div
              key={s.id}
              className="flex gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div
                className="w-1 rounded-full flex-shrink-0 self-stretch"
                style={{ backgroundColor: s.companies?.color ?? "#6366f1" }}
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-500 mb-0.5 truncate">
                  {s.companies?.name ?? "알 수 없음"}
                </p>
                <p className="text-sm font-semibold text-gray-900 mb-0.5 truncate">
                  {s.sample_code}
                </p>
                <p className="text-xs text-gray-500 line-clamp-2">{s.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100 text-right">
        <span className="text-xs text-gray-400">총 {schedules.length}건</span>
      </div>
    </div>
  );
}
