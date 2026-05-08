"use client";

import { TimeSlot } from "@/types";

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selected: string;
  onSelect: (time: string) => void;
  loading?: boolean;
}

export default function TimeSlotPicker({
  slots,
  selected,
  onSelect,
  loading,
}: TimeSlotPickerProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return <p className="text-gray-500 text-sm">날짜를 먼저 선택해주세요.</p>;
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map(({ time, available }) => (
        <button
          key={time}
          type="button"
          disabled={!available}
          onClick={() => onSelect(time)}
          className={[
            "h-10 rounded-lg text-sm font-medium border transition-colors",
            !available
              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              : selected === time
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600",
          ].join(" ")}
        >
          {available ? time : "마감"}
        </button>
      ))}
    </div>
  );
}
