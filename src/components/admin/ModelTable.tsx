"use client";

import { useState } from "react";
import { Model } from "@/types";

interface Props {
  models: Model[];
  onToggle: (id: string, is_active: boolean) => void;
  onCredentialUpdated?: () => void;
}

export default function ModelTable({ models, onToggle, onCredentialUpdated }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ login_id: "", password: "", hourly_rate: "" });
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const openEdit = (model: Model) => {
    setEditingId(model.id);
    setEditForm({
      login_id: model.login_id ?? "",
      password: "",
      hourly_rate: model.hourly_rate != null ? String(model.hourly_rate) : "",
    });
    setEditError("");
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditError("");
  };

  const handleSave = async () => {
    if (!editingId) return;
    if (!editForm.login_id.trim()) {
      setEditError("로그인 아이디를 입력해주세요.");
      return;
    }
    if (editForm.password && editForm.password.length < 8) {
      setEditError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (editForm.hourly_rate && isNaN(Number(editForm.hourly_rate))) {
      setEditError("시급은 숫자로 입력해주세요.");
      return;
    }

    setEditSaving(true);
    setEditError("");

    const body: Record<string, string | number | null> = { login_id: editForm.login_id.trim() };
    if (editForm.password) body.password = editForm.password;
    body.hourly_rate = editForm.hourly_rate ? Number(editForm.hourly_rate) : null;

    const res = await fetch(`/api/models/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();

    if (!res.ok) {
      setEditError(json.error ?? "저장에 실패했습니다.");
    } else {
      closeEdit();
      onCredentialUpdated?.();
    }
    setEditSaving(false);
  };

  if (models.length === 0) {
    return <p className="text-center text-sm text-gray-400 py-8">등록된 모델이 없습니다.</p>;
  }

  return (
    <>
      <div className="space-y-3">
        {models.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between gap-3 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900">{m.name}</p>
                <p className="text-xs text-gray-400 mt-0.5 font-mono truncate">
                  {m.login_id || "—"}
                </p>
                {m.hourly_rate != null && (
                  <p className="text-xs text-pink-500 mt-0.5 font-medium">
                    ₩{m.hourly_rate.toLocaleString()}/h
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => openEdit(m)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                편집
              </button>
              <button
                onClick={() => onToggle(m.id, !m.is_active)}
                className={[
                  "text-xs font-medium border rounded-lg px-3 py-1.5 transition-colors",
                  m.is_active
                    ? "text-red-500 border-red-200 hover:bg-red-50"
                    : "text-green-600 border-green-200 hover:bg-green-50",
                ].join(" ")}
              >
                {m.is_active ? "비활성화" : "활성화"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-bold text-base text-gray-900 mb-1">계정 정보 편집</h3>
            <p className="text-xs text-gray-400 mb-5">
              {models.find((m) => m.id === editingId)?.name}
            </p>

            {editError && (
              <div className="mb-4 bg-red-50 text-red-600 text-xs rounded-lg p-3">{editError}</div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">로그인 아이디</label>
                <input
                  type="text"
                  value={editForm.login_id}
                  onChange={(e) => setEditForm((p) => ({ ...p, login_id: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="소문자, 숫자, _ 만 사용"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  새 비밀번호 <span className="text-gray-400 font-normal">(변경 시에만 입력)</span>
                </label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm((p) => ({ ...p, password: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="8자 이상"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  시급 (원) <span className="text-gray-400 font-normal">(선택)</span>
                </label>
                <input
                  type="number"
                  value={editForm.hourly_rate}
                  onChange={(e) => setEditForm((p) => ({ ...p, hourly_rate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="예: 15000"
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={closeEdit}
                className="flex-1 text-sm text-gray-500 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={editSaving}
                className="flex-1 text-sm font-semibold bg-pink-600 text-white rounded-xl py-2.5 hover:bg-pink-700 disabled:opacity-50 transition-colors"
              >
                {editSaving ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
