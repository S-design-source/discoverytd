import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { ScheduleWithCompany, ModelScheduleWithModel } from "@/types";

interface Props {
  date: string;
  schedules: ScheduleWithCompany[];
  modelSchedules: ModelScheduleWithModel[];
}

function getSampleCodeColor(code: string): string {
  const prefix = code.slice(0, 2).toUpperCase();
  if (prefix === "DX") return "#16a34a";
  if (prefix === "DM") return "#2563eb";
  if (prefix === "DW") return "#dc2626";
  return "#6366f1";
}

export default function DaySchedulePanel({ date, schedules, modelSchedules }: Props) {
  const parsed = parseISO(date);
  const label = format(parsed, "M월 d일 (EEE)", { locale: ko });
  const total = schedules.length + modelSchedules.length;

  return (
    <div className="w-72 flex-shrink-0 bg-white rounded-2xl shadow-sm p-5 flex flex-col">
      <h3 className="font-bold text-base mb-4 text-gray-800">{label}</h3>

      {total === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400">등록된 스케줄이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto flex-1">
          {schedules.map((s) => (
            <div key={s.id} className="flex gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div
                className="w-1 rounded-full flex-shrink-0 self-stretch"
                style={{ backgroundColor: s.companies?.color ?? "#6366f1" }}
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-500 mb-0.5 truncate">
                  {s.companies?.name ?? "알 수 없음"}
                </p>
                <p
                  className="text-sm font-semibold mb-0.5 truncate"
                  style={{ color: getSampleCodeColor(s.sample_code) }}
                >
                  {s.sample_code}
                </p>
                <p className="text-xs text-gray-500 line-clamp-2">{s.content}</p>
              </div>
            </div>
          ))}
          {modelSchedules.map((m) => (
            <div key={m.id} className="flex gap-3 p-3 rounded-xl bg-pink-50 hover:bg-pink-100 transition-colors">
              <div
                className="w-1 rounded-full flex-shrink-0 self-stretch"
                style={{ backgroundColor: m.models?.color ?? "#ec4899" }}
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-pink-500 mb-0.5 truncate">
                  {m.models?.name ?? "알 수 없음"} · 피팅
                </p>
                <p className="text-sm font-semibold text-gray-900 mb-0.5">
                  {m.start_time.slice(0, 5)} ~ {m.end_time.slice(0, 5)}
                </p>
                {m.content && (
                  <p className="text-xs text-gray-500 line-clamp-2">{m.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100 text-right">
        <span className="text-xs text-gray-400">총 {total}건</span>
      </div>
    </div>
  );
}
