"use client";

import { Model } from "@/types";

interface Props {
  models: Model[];
  onToggle: (id: string, is_active: boolean) => void;
}

export default function ModelTable({ models, onToggle }: Props) {
  if (models.length === 0) {
    return <p className="text-center text-sm text-gray-400 py-8">등록된 모델이 없습니다.</p>;
  }

  return (
    <div className="space-y-3">
      {models.map((m) => (
        <div key={m.id} className="flex items-center justify-between gap-3 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
            <div>
              <p className="text-sm font-bold text-gray-900">{m.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {m.is_active ? "활성" : "비활성"}
              </p>
            </div>
          </div>
          <button
            onClick={() => onToggle(m.id, !m.is_active)}
            className={[
              "text-xs font-medium border rounded-lg px-3 py-1.5 transition-colors",
              m.is_active
                ? "text-red-500 border-red-200 hover:bg-red-50"
                : "text-green-600 border-green-200 hover:bg-green-50",
            ].join(" ")}
          >
            {m.is_active ? "비활성화" : "활성화"}
          </button>
        </div>
      ))}
    </div>
  );
}
