"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CalendarView from "@/components/admin/CalendarView";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="font-bold text-base text-gray-900">Discovery 샘플접수 관리</h1>
          <Link
            href="/admin/companies"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            업체 관리
          </Link>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5"
        >
          로그아웃
        </button>
      </header>

      <main className="p-4 sm:p-6 h-[calc(100vh-57px)]">
        <CalendarView />
      </main>
    </div>
  );
}
