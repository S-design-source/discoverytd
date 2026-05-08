"use client";

import Link from "next/link";
import { SampleSchedule } from "@/types";

interface ScheduleListProps {
  schedules: SampleSchedule[];
  onDelete: (id: string) => void;
}

export default function ScheduleList({ schedules, onDelete }: ScheduleListProps) {
  if (schedules.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        등록된 스케줄이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {schedules.map((s) => (
        <div
          key={s.id}
          className="bg-gray-50 rounded-xl p-4 flex items-start justify-between gap-3 hover:bg-gray-100 transition-colors"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-500 font-medium">{s.date}</span>
            </div>
            <p className="font-semibold text-gray-900 text-sm mb-0.5 truncate">{s.sample_code}</p>
            <p className="text-xs text-gray-500 line-clamp-2">{s.content}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link
              href={`/company/schedules/${s.id}/edit`}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50"
            >
              수정
            </Link>
            <button
              onClick={() => {
                if (confirm("이 스케줄을 삭제할까요?")) onDelete(s.id);
              }}
              className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50"
            >
              삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
