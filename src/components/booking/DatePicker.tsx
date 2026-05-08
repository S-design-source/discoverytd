"use client";

import { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isBefore, isToday, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";
import { isClosedDay } from "@/lib/utils/timeSlots";

interface DatePickerProps {
  selected: Date | null;
  onSelect: (date: Date) => void;
}

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function DatePicker({ selected, onSelect }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const firstDayOfWeek = getDay(startOfMonth(currentMonth));

  const isDisabled = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return isBefore(d, today) || isClosedDay(date);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="이전 달"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-semibold text-lg">
          {format(currentMonth, "yyyy년 M월", { locale: ko })}
        </span>
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="다음 달"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-sm font-medium text-gray-500 py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((date) => {
          const disabled = isDisabled(date);
          const isSelected = selected && isSameDay(date, selected);
          const todayMark = isToday(date);

          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(date)}
              className={[
                "h-10 w-full rounded-lg text-sm font-medium transition-colors",
                disabled ? "text-gray-300 cursor-not-allowed" : "hover:bg-blue-50 cursor-pointer",
                isSelected ? "bg-blue-600 text-white hover:bg-blue-600" : "",
                todayMark && !isSelected ? "text-blue-600 font-bold" : "",
                !isSelected && !disabled ? "text-gray-800" : "",
              ].join(" ")}
            >
              {format(date, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
