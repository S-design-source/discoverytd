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

  // 엑셀 내보내기 상태
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportRange, setExportRange] = useState({ from: "", to: "" });
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

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

  const handleExport = async () => {
    if (!exportRange.from || !exportRange.to) {
      setExportError("시작일과 종료일을 모두 선택해주세요.");
      return;
    }
    if (exportRange.from > exportRange.to) {
      setExportError("시작일이 종료일보다 클 수 없습니다.");
      return;
    }

    // 같은 달인지 검증
    const fromMonth = exportRange.from.slice(0, 7);
    const toMonth = exportRange.to.slice(0, 7);
    if (fromMonth !== toMonth) {
      setExportError("시작일과 종료일은 같은 달이어야 합니다.");
      return;
    }

    setExporting(true);
    setExportError("");

    try {
      const url = `/api/admin/model-schedule-export?from=${exportRange.from}&to=${exportRange.to}`;
      const res = await fetch(url);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setExportError(data.error ?? "데이터 조회에 실패했습니다.");
        return;
      }

      const blob = await res.blob();
      const fileName = decodeURIComponent(
        res.headers.get("Content-Disposition")?.match(/filename\*=UTF-8''(.+)/)?.[1] ?? "피팅업무확인서.xlsx"
      );
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(a.href);

      setShowExportModal(false);
      setExportRange({ from: "", to: "" });
    } finally {
      setExporting(false);
    }
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
            <div>
              <h2 className="font-bold text-base">모델 목록</h2>
              <p className="text-xs text-gray-400">총 {models.length}명</p>
            </div>
            <button
              onClick={() => { setShowExportModal(true); setExportError(""); }}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-green-600 text-green-700 hover:bg-green-50 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              엑셀 내보내기
            </button>
          </div>
          {loading ? (
            <p className="text-center text-sm text-gray-400 py-8">로딩 중...</p>
          ) : (
            <ModelTable
              models={models}
              onToggle={handleToggle}
              onCredentialUpdated={() =>
                fetch("/api/models")
                  .then((r) => r.json())
                  .then((data) => setModels(Array.isArray(data) ? data : []))
              }
            />
          )}
        </div>
      </main>

      {/* 엑셀 내보내기 모달 */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-bold text-base text-gray-900 mb-1">피팅 데이터 내보내기</h3>
            <p className="text-xs text-gray-400 mb-5">피팅 업무 확인서 양식으로 다운로드합니다. 시작일과 종료일은 같은 달이어야 합니다.</p>

            {exportError && (
              <div className="mb-4 bg-red-50 text-red-600 text-xs rounded-lg p-3">{exportError}</div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">시작일</label>
                <input
                  type="date"
                  value={exportRange.from}
                  onChange={(e) => setExportRange((p) => ({ ...p, from: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">종료일</label>
                <input
                  type="date"
                  value={exportRange.to}
                  onChange={(e) => setExportRange((p) => ({ ...p, to: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => { setShowExportModal(false); setExportRange({ from: "", to: "" }); }}
                className="flex-1 text-sm text-gray-500 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex-1 text-sm font-semibold bg-green-600 text-white rounded-xl py-2.5 hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {exporting ? "처리 중..." : "내보내기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
