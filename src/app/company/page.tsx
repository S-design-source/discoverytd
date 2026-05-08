"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ScheduleList from "@/components/company/ScheduleList";
import { SampleSchedule } from "@/types";
import Link from "next/link";

export default function CompanyPage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<SampleSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    fetch("/api/auth/role")
      .then((r) => r.json())
      .then(({ companyName }) => { if (companyName) setCompanyName(companyName); });

    fetch("/api/schedules")
      .then((r) => r.json())
      .then((data) => setSchedules(Array.isArray(data) ? data : []))
      .catch(() => setSchedules([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/schedules/${id}`, { method: "DELETE" });
    if (res.ok) setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-base text-gray-900">
            {companyName || "샘플접수 스케줄"}
          </h1>
          <p className="text-xs text-gray-500">샘플접수 스케줄 관리</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/company/schedules/new"
            className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + 스케줄 등록
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-base">내 스케줄 목록</h2>
            <span className="text-xs text-gray-400">총 {schedules.length}건</span>
          </div>

          {loading ? (
            <p className="text-center text-sm text-gray-400 py-8">로딩 중...</p>
          ) : (
            <ScheduleList schedules={schedules} onDelete={handleDelete} />
          )}
        </div>
      </main>
    </div>
  );
}
