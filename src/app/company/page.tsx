"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  format, addMonths, subMonths,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isToday, parseISO,
} from "date-fns";
import { ko } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";
import { SampleSchedule } from "@/types";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

function getSampleCodeColor(code: string): string {
  const prefix = code.slice(0, 2).toUpperCase();
  if (prefix === "DX") return "#16a34a";
  if (prefix === "DM") return "#2563eb";
  if (prefix === "DW") return "#dc2626";
  return "#6366f1";
}

type ModalType = "create" | "edit" | null;

interface EditTarget {
  id: string;
  date: string;
  sample_code: string;
  content: string;
}

export default function CompanyPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [schedules, setSchedules] = useState<SampleSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [modalType, setModalType] = useState<ModalType>(null);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [form, setForm] = useState({ date: "", sample_code: "", content: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const monthKey = format(currentMonth, "yyyy-MM");

  useEffect(() => {
    fetch("/api/auth/role")
      .then((r) => r.json())
      .then((d) => setCompanyName(d.companyName ?? ""));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/schedules?month=${monthKey}`)
      .then((r) => r.json())
      .then((data) => setSchedules(Array.isArray(data) ? data : []))
      .catch(() => setSchedules([]))
      .finally(() => setLoading(false));
  }, [monthKey]);

  const byDate = useMemo(() => {
    return schedules.reduce((acc, s) => {
      if (!acc[s.date]) acc[s.date] = [];
      acc[s.date].push(s);
      return acc;
    }, {} as Record<string, SampleSchedule[]>);
  }, [schedules]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const daySchedules = byDate[selectedDate] ?? [];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const refreshMonth = async () => {
    const data = await fetch(`/api/schedules?month=${monthKey}`).then((r) => r.json());
    setSchedules(Array.isArray(data) ? data : []);
  };

  const openCreate = () => {
    setForm({ date: selectedDate, sample_code: "", content: "" });
    setFormError("");
    setModalType("create");
  };

  const openEdit = (s: SampleSchedule) => {
    setEditTarget({ id: s.id, date: s.date, sample_code: s.sample_code, content: s.content });
    setForm({ date: s.date, sample_code: s.sample_code, content: s.content });
    setFormError("");
    setModalType("edit");
    setExpandedId(null);
  };

  const closeModal = () => {
    setModalType(null);
    setEditTarget(null);
    setFormError("");
  };

  const handleSubmit = async () => {
    if (!form.date || !form.sample_code.trim() || !form.content.trim()) {
      setFormError("모든 필드를 입력해주세요.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      let res: Response;
      if (modalType === "create") {
        res = await fetch("/api/schedules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch(`/api/schedules/${editTarget!.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      if (!res.ok) {
        const json = await res.json();
        setFormError(json.error ?? "오류가 발생했습니다.");
        return;
      }
      await refreshMonth();
      setSelectedDate(form.date);
      closeModal();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 샘플 접수를 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/schedules/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      setExpandedId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="font-bold text-base text-gray-900">{companyName || "업체"}</h1>
          <p className="text-xs text-gray-400">샘플접수 관리</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openCreate}
            className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + 샘플접수
          </button>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-2"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className="flex-1 flex gap-4 p-4 sm:p-6 overflow-hidden">
        {/* 달력 */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm p-5 flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="font-bold text-lg">{format(currentMonth, "yyyy년 M월", { locale: ko })}</h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 rounded-xl overflow-hidden flex-1">
            {calendarDays.map((date) => {
              const dateStr = format(date, "yyyy-MM-dd");
              const dots = byDate[dateStr] ?? [];
              const isSelected = selectedDate === dateStr;
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const todayMark = isToday(date);

              return (
                <button
                  key={dateStr}
                  onClick={() => { setSelectedDate(dateStr); setExpandedId(null); }}
                  className={[
                    "bg-white p-1.5 min-h-16 text-left flex flex-col transition-colors",
                    isSelected ? "ring-2 ring-blue-500 ring-inset" : "hover:bg-blue-50",
                    !isCurrentMonth ? "opacity-40" : "",
                  ].join(" ")}
                >
                  <span className={[
                    "text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1",
                    todayMark ? "bg-blue-600 text-white" : "text-gray-700",
                  ].join(" ")}>
                    {format(date, "d")}
                  </span>
                  <div className="flex flex-wrap gap-0.5">
                    {dots.slice(0, 3).map((s) => (
                      <span
                        key={s.id}
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getSampleCodeColor(s.sample_code) }}
                      />
                    ))}
                    {dots.length > 3 && (
                      <span className="text-xs text-gray-400">+{dots.length - 3}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {loading && <p className="text-center text-xs text-gray-400 mt-3">로딩 중...</p>}
        </div>

        {/* 우측 패널 */}
        <div className="w-72 flex-shrink-0 bg-white rounded-2xl shadow-sm p-5 flex flex-col">
          <h3 className="font-bold text-base mb-1 text-gray-800">
            {format(parseISO(selectedDate), "M월 d일 (EEE)", { locale: ko })}
          </h3>
          <p className="text-xs text-gray-400 mb-4">총 {daySchedules.length}건</p>

          {daySchedules.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <p className="text-sm text-gray-400">등록된 샘플이 없습니다.</p>
              <button
                onClick={openCreate}
                className="text-sm text-blue-600 font-medium hover:underline"
              >
                + 샘플 접수하기
              </button>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto flex-1">
              {daySchedules.map((s) => (
                <div key={s.id}>
                  <button
                    onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                    className="w-full flex gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  >
                    <div
                      className="w-1 rounded-full flex-shrink-0 self-stretch"
                      style={{ backgroundColor: getSampleCodeColor(s.sample_code) }}
                    />
                    <div className="min-w-0">
                      <p
                        className="text-sm font-semibold mb-0.5 truncate"
                        style={{ color: getSampleCodeColor(s.sample_code) }}
                      >
                        {s.sample_code}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-2">{s.content}</p>
                    </div>
                  </button>
                  {expandedId === s.id && (
                    <div className="flex gap-2 mt-1 px-1">
                      <button
                        onClick={() => openEdit(s)}
                        className="flex-1 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg py-1.5 hover:bg-blue-50 transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="flex-1 text-xs font-medium text-red-500 border border-red-200 rounded-lg py-1.5 hover:bg-red-50 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 등록/수정 모달 */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-bold text-base text-gray-900 mb-5">
              {modalType === "create" ? "샘플 접수" : "샘플 수정"}
            </h3>

            {formError && (
              <div className="mb-4 bg-red-50 text-red-600 text-xs rounded-lg p-3">{formError}</div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">날짜</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">품번</label>
                <input
                  type="text"
                  value={form.sample_code}
                  onChange={(e) => setForm((p) => ({ ...p, sample_code: e.target.value }))}
                  placeholder="예: DX-24SS-001"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">내용</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 text-sm text-gray-500 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 text-sm font-semibold bg-blue-600 text-white rounded-xl py-2.5 hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? "처리 중..." : modalType === "create" ? "접수" : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
