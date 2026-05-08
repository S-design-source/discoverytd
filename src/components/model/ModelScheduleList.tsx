"use client";

import Link from "next/link";
import { ModelSchedule } from "@/types";

interface Props {
  schedules: ModelSchedule[];
  onDelete: (id: string) => void;
}

export default function ModelScheduleList({ schedules, onDelete }: Props) {
  if (schedules.length === 0) {
    return <p className="text-center text-sm text-gray-400 py-8">등록된 피팅 일정이 없습니다.</p>;
  }

  return (
    <div className="space-y-3">
      {schedules.map((s) => (
        <div key={s.id} className="flex items-start justify-between gap-3 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900">{s.date}</p>
            <p className="text-sm text-pink-600 font-semibold mt-0.5">
              {s.start_time.slice(0, 5)} ~ {s.end_time.slice(0, 5)}
            </p>
            {s.content && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{s.content}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href={`/model/schedules/${s.id}/edit`}
              className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg px-2.5 py-1.5"
            >
              수정
            </Link>
            <button
              onClick={() => {
                if (confirm("삭제하시겠습니까?")) onDelete(s.id);
              }}
              className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-2.5 py-1.5"
            >
              삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
