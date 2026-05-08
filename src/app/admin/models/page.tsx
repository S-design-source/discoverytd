"use client";

import { useState, useEffect } from "react";
import ModelTable from "@/components/admin/ModelTable";
import { Model } from "@/types";
import Link from "next/link";

export default function AdminModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", login_id: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/models")
      .then((r) => r.json())
      .then((data) => setModels(Array.isArray(data) ? data : []))
      .catch(() => setModels([]))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (id: string, is_active: boolean) => {
    const res = await fetch(`/api/models/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active }),
    });
    if (res.ok) {
      setModels((prev) => prev.map((m) => m.id === id ? { ...m, is_active } : m));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "오류가 발생했습니다.");
    } else {
      setSuccess(`모델 계정이 생성됐습니다. 로그인 ID: ${json.login_id}`);
      setForm({ name: "", login_id: "", password: "" });
      setModels((prev) => [{ id: json.id, name: json.name, color: "#ec4899", is_active: true, created_at: new Date().toISOString() }, ...prev]);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-3 flex items-center gap-3">
        <Link href="/admin" className="text-gray-500 hover:text-gray-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="font-bold text-base text-gray-900">모델 관리</h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* 모델 계정 생성 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-base mb-4">모델 계정 생성</h2>
          {error && <div className="mb-3 bg-red-50 text-red-700 rounded-lg p-3 text-sm">{error}</div>}
          {success && <div className="mb-3 bg-green-50 text-green-700 rounded-lg p-3 text-sm">{success}</div>}
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">모델명</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
                placeholder="예: 김지수"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">로그인 아이디</label>
              <input
                type="text"
                value={form.login_id}
                onChange={(e) => setForm((p) => ({ ...p, login_id: e.target.value }))}
                required
                placeholder="소문자, 숫자, _ 만 사용"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                required
                placeholder="8자 이상"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-pink-600 text-white rounded-xl py-3 font-semibold text-sm hover:bg-pink-700 transition-colors disabled:opacity-50"
            >
              {submitting ? "생성 중..." : "모델 계정 생성"}
            </button>
          </form>
        </div>

        {/* 모델 목록 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base">모델 목록</h2>
            <span className="text-xs text-gray-400">총 {models.length}명</span>
          </div>
          {loading ? (
            <p className="text-center text-sm text-gray-400 py-8">로딩 중...</p>
          ) : (
            <ModelTable models={models} onToggle={handleToggle} />
          )}
        </div>
      </main>
    </div>
  );
}
