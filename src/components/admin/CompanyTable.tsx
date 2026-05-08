"use client";

import { useState } from "react";
import { Company } from "@/types";

interface CompanyTableProps {
  companies: Company[];
  onToggleActive: (id: string, isActive: boolean) => void;
}

export default function CompanyTable({ companies, onToggleActive }: CompanyTableProps) {
  const [updating, setUpdating] = useState<string | null>(null);

  const handleToggle = async (id: string, isActive: boolean) => {
    setUpdating(id);
    await onToggleActive(id, isActive);
    setUpdating(null);
  };

  if (companies.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        등록된 업체가 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="pb-3 pr-4 font-medium">색상</th>
            <th className="pb-3 pr-4 font-medium">업체명</th>
            <th className="pb-3 pr-4 font-medium">업체코드</th>
            <th className="pb-3 pr-4 font-medium">등록일</th>
            <th className="pb-3 font-medium">상태</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {companies.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="py-3 pr-4">
                <div
                  className="w-5 h-5 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
              </td>
              <td className="py-3 pr-4 font-medium text-gray-900">{c.name}</td>
              <td className="py-3 pr-4 font-mono text-xs text-gray-500">{c.company_code}</td>
              <td className="py-3 pr-4 text-gray-500">
                {new Date(c.created_at).toLocaleDateString("ko-KR")}
              </td>
              <td className="py-3">
                <button
                  disabled={updating === c.id}
                  onClick={() => handleToggle(c.id, !c.is_active)}
                  className={[
                    "text-xs font-medium px-3 py-1 rounded-full transition-colors",
                    c.is_active
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200",
                    updating === c.id ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                  ].join(" ")}
                >
                  {c.is_active ? "활성" : "비활성"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
