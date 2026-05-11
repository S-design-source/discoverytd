"use client";

import { useState } from "react";
import { Company } from "@/types";

interface CompanyTableProps {
  companies: Company[];
  onToggleActive: (id: string, isActive: boolean) => void;
  onCredentialUpdated?: () => void;
}

export default function CompanyTable({ companies, onToggleActive, onCredentialUpdated }: CompanyTableProps) {
  const [updating, setUpdating] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ login_id: "", password: "" });
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const handleToggle = async (id: string, isActive: boolean) => {
    setUpdating(id);
    await onToggleActive(id, isActive);
    setUpdating(null);
  };

  const openEdit = (company: Company) => {
    setEditingId(company.id);
    setEditForm({ login_id: company.login_id ?? "", password: "" });
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

    setEditSaving(true);
    setEditError("");

    const body: Record<string, string> = { login_id: editForm.login_id.trim() };
    if (editForm.password) body.password = editForm.password;

    const res = await fetch(`/api/companies/${editingId}`, {
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

  if (companies.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        등록된 업체가 없습니다.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-3 pr-4 font-medium">색상</th>
              <th className="pb-3 pr-4 font-medium">업체명</th>
              <th className="pb-3 pr-4 font-medium">업체코드</th>
              <th className="pb-3 pr-4 font-medium">로그인 ID</th>
              <th className="pb-3 pr-4 font-medium">등록일</th>
              <th className="pb-3 pr-4 font-medium">상태</th>
              <th className="pb-3 font-medium">계정 편집</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {companies.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="py-3 pr-4">
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: c.color }} />
                </td>
                <td className="py-3 pr-4 font-medium text-gray-900">{c.name}</td>
                <td className="py-3 pr-4 font-mono text-xs text-gray-500">{c.company_code}</td>
                <td className="py-3 pr-4 font-mono text-xs text-gray-600">{c.login_id || "—"}</td>
                <td className="py-3 pr-4 text-gray-500">
                  {new Date(c.created_at).toLocaleDateString("ko-KR")}
                </td>
                <td className="py-3 pr-4">
                  <button
                    disabled={updating === c.id}
                    onClick={() => handleToggle(c.id, !c.is_active)}
                    className={[
                      "text-xs font-medium px-3 py-1 rounded-full transition-colors",
                      c.is_active
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200",
                      updating === c.id ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                    ].join(" ")}
                  >
                    {c.is_active ? "활성" : "비활성"}
                  </button>
                </td>
                <td className="py-3">
                  <button
                    onClick={() => openEdit(c)}
                    className="text-xs font-medium px-3 py-1 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    편집
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-bold text-base text-gray-900 mb-1">계정 정보 편집</h3>
            <p className="text-xs text-gray-400 mb-5">
              {companies.find((c) => c.id === editingId)?.name}
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="8자 이상"
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
                className="flex-1 text-sm font-semibold bg-blue-600 text-white rounded-xl py-2.5 hover:bg-blue-700 disabled:opacity-50 transition-colors"
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
