"use client";

import { useState, useEffect, useMemo } from "react";
import {
  format, addMonths, subMonths,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isToday,
} from "date-fns";
import { ko } from "date-fns/locale";
import { ScheduleWithCompany, ModelScheduleWithModel } from "@/types";
import DaySchedulePanel from "./DaySchedulePanel";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
type FilterType = "all" | "sample" | "model";

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [sampleSchedules, setSampleSchedules] = useState<ScheduleWithCompany[]>([]);
  const [modelSchedules, setModelSchedules] = useState<ModelScheduleWithModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  const monthKey = format(currentMonth, "yyyy-MM");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/schedules?month=${monthKey}`).then((r) => r.json()),
      fetch(`/api/model-schedules?month=${monthKey}`).then((r) => r.json()),
    ])
      .then(([samples, models]) => {
        setSampleSchedules(Array.isArray(samples) ? samples : []);
        setModelSchedules(Array.isArray(models) ? models : []);
      })
      .catch(() => {
        setSampleSchedules([]);
        setModelSchedules([]);
      })
      .finally(() => setLoading(false));
  }, [monthKey]);

  const sampleByDate = useMemo(() => {
    return sampleSchedules.reduce((acc, s) => {
      if (!acc[s.date]) acc[s.date] = [];
      acc[s.date].push(s);
      return acc;
    }, {} as Record<string, ScheduleWithCompany[]>);
  }, [sampleSchedules]);

  const modelByDate = useMemo(() => {
    return modelSchedules.reduce((acc, s) => {
      if (!acc[s.date]) acc[s.date] = [];
      acc[s.date].push(s);
      return acc;
    }, {} as Record<string, ModelScheduleWithModel[]>);
  }, [modelSchedules]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const daySamples = filter !== "model" ? (sampleByDate[selectedDate] ?? []) : [];
  const dayModels = filter !== "sample" ? (modelByDate[selectedDate] ?? []) : [];

  return (
    <div className="flex gap-4 h-full">
      <div className="flex-1 bg-white rounded-2xl shadow-sm p-5 min-w-0 flex flex-col">
        {/* 월 네비게이션 */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="font-bold text-lg">
            {format(currentMonth, "yyyy년 M월", { locale: ko })}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 필터 */}
        <div className="flex gap-2 mb-3">
          {(["all", "sample", "model"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                "text-xs font-semibold px-3 py-1.5 rounded-full transition-colors",
                filter === f
                  ? f === "model" ? "bg-pink-600 text-white" : "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200",
              ].join(" ")}
            >
              {f === "all" ? "전체" : f === "sample" ? "샘플접수" : "모델 피팅"}
            </button>
          ))}
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">
              {d}
            </div>
          ))}
        </div>

        {/* 날짜 셀 */}
        <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 rounded-xl overflow-hidden flex-1">
          {calendarDays.map((date) => {
            const dateStr = format(date, "yyyy-MM-dd");
            const samples = filter !== "model" ? (sampleByDate[dateStr] ?? []) : [];
            const models = filter !== "sample" ? (modelByDate[dateStr] ?? []) : [];
            const allDots = [
              ...samples.map((s) => ({ id: s.id, color: s.companies?.color ?? "#6366f1" })),
              ...models.map((m) => ({ id: m.id, color: m.models?.color ?? "#ec4899" })),
            ];
            const isSelected = selectedDate === dateStr;
            const isCurrentMonth = isSameMonth(date, currentMonth);
            const todayMark = isToday(date);

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={[
                  "bg-white p-1.5 min-h-16 text-left flex flex-col transition-colors",
                  isSelected ? "ring-2 ring-blue-500 ring-inset" : "hover:bg-blue-50",
                  !isCurrentMonth ? "opacity-40" : "",
                ].join(" ")}
              >
                <span
                  className={[
                    "text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1",
                    todayMark ? "bg-blue-600 text-white" : "text-gray-700",
                  ].join(" ")}
                >
                  {format(date, "d")}
                </span>
                <div className="flex flex-wrap gap-0.5">
                  {allDots.slice(0, 3).map((dot) => (
                    <span
                      key={dot.id}
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: dot.color }}
                    />
                  ))}
                  {allDots.length > 3 && (
                    <span className="text-xs text-gray-400">+{allDots.length - 3}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {loading && (
          <p className="text-center text-xs text-gray-400 mt-3">로딩 중...</p>
        )}
      </div>

      <DaySchedulePanel
        date={selectedDate}
        schedules={daySamples}
        modelSchedules={dayModels}
      />
    </div>
  );
}
