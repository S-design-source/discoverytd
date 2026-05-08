"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import BookingTable from "@/components/admin/BookingTable";
import { Booking, BookingStatus } from "@/types";
import { siteConfig } from "@/config/site";

const FILTER_OPTIONS = [
  { label: "오늘", value: "today" },
  { label: "이번 주", value: "week" },
  { label: "전체", value: "all" },
];

const STATUS_OPTIONS = [
  { label: "전체", value: "all" },
  { label: "대기", value: "pending" },
  { label: "확정", value: "confirmed" },
  { label: "취소", value: "cancelled" },
];

function getDateRange(filter: string): string | null {
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  if (filter === "today") return fmt(today);
  return null;
}

export default function AdminPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("today");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    const date = getDateRange(dateFilter);
    if (date) params.set("date", date);
    if (statusFilter !== "all") params.set("status", statusFilter);

    const res = await fetch(`/api/bookings?${params.toString()}`);
    const data = await res.json();
    setBookings(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [dateFilter, statusFilter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleStatusChange = async (id: string, status: BookingStatus) => {
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg">{siteConfig.name}</h1>
          <p className="text-xs text-gray-500">관리자 대시보드</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5"
        >
          로그아웃
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* 통계 카드 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "총 예약", value: stats.total, color: "text-gray-800" },
            { label: "대기중", value: stats.pending, color: "text-yellow-600" },
            { label: "확정", value: stats.confirmed, color: "text-green-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* 필터 */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {FILTER_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setDateFilter(o.value)}
                  className={[
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                    dateFilter === o.value ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700",
                  ].join(" ")}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {STATUS_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setStatusFilter(o.value)}
                  className={[
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                    statusFilter === o.value ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700",
                  ].join(" ")}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400 text-sm">로딩 중...</div>
          ) : (
            <BookingTable bookings={bookings} onStatusChange={handleStatusChange} />
          )}
        </div>
      </main>
    </div>
  );
}
