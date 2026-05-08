"use client";

import { useState } from "react";
import { Booking, BookingStatus } from "@/types";

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "대기",
  confirmed: "확정",
  cancelled: "취소",
};

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-500",
};

interface BookingTableProps {
  bookings: Booking[];
  onStatusChange: (id: string, status: BookingStatus) => void;
}

export default function BookingTable({ bookings, onStatusChange }: BookingTableProps) {
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatus = async (id: string, status: BookingStatus) => {
    setUpdating(id);
    await onStatusChange(id, status);
    setUpdating(null);
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        예약 내역이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="pb-3 pr-4 font-medium">예약번호</th>
            <th className="pb-3 pr-4 font-medium">날짜</th>
            <th className="pb-3 pr-4 font-medium">시간</th>
            <th className="pb-3 pr-4 font-medium">예약자</th>
            <th className="pb-3 pr-4 font-medium">연락처</th>
            <th className="pb-3 pr-4 font-medium">인원</th>
            <th className="pb-3 pr-4 font-medium">상태</th>
            <th className="pb-3 font-medium">요청사항</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {bookings.map((b) => (
            <tr key={b.id} className="hover:bg-gray-50">
              <td className="py-3 pr-4 font-mono text-xs text-gray-500">
                {b.id.slice(0, 8).toUpperCase()}
              </td>
              <td className="py-3 pr-4">{b.date}</td>
              <td className="py-3 pr-4">{String(b.time_slot).slice(0, 5)}</td>
              <td className="py-3 pr-4 font-medium">{b.name}</td>
              <td className="py-3 pr-4">{b.phone}</td>
              <td className="py-3 pr-4">{b.party_size}명</td>
              <td className="py-3 pr-4">
                <select
                  value={b.status}
                  disabled={updating === b.id}
                  onChange={(e) => handleStatus(b.id, e.target.value as BookingStatus)}
                  className={[
                    "text-xs font-medium rounded-full px-2 py-1 border-0 cursor-pointer",
                    STATUS_COLORS[b.status],
                    updating === b.id ? "opacity-50" : "",
                  ].join(" ")}
                >
                  {(Object.keys(STATUS_LABELS) as BookingStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </td>
              <td className="py-3 text-gray-500 max-w-32 truncate" title={b.notes}>
                {b.notes || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
