"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { companyCreateSchema, CompanyCreateSchemaType } from "@/lib/validations/schedule";
import CompanyTable from "@/components/admin/CompanyTable";
import { Company } from "@/types";
import Link from "next/link";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CompanyCreateSchemaType>({
    resolver: zodResolver(companyCreateSchema),
  });

  const fetchCompanies = async () => {
    const res = await fetch("/api/companies");
    const data = await res.json();
    setCompanies(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchCompanies(); }, []);

  const onSubmit = async (data: CompanyCreateSchemaType) => {
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "오류가 발생했습니다.");
    } else {
      setSuccess(`업체 계정이 생성되었습니다. 로그인 ID: ${data.login_id}`);
      reset();
      setShowForm(false);
      fetchCompanies();
    }
    setIsSubmitting(false);
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await fetch(`/api/companies/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: isActive }),
    });
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_active: isActive } : c))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-3 flex items-center gap-3">
        <Link href="/admin" className="text-gray-500 hover:text-gray-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="font-bold text-base text-gray-900">업체 계정 관리</h1>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {success && (
          <div className="mb-4 bg-green-50 text-green-700 rounded-lg p-3 text-sm">{success}</div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base">하청업체 목록</h2>
            <button
              onClick={() => { setShowForm(!showForm); setError(""); }}
              className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + 업체 추가
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit(onSubmit)} className="border border-gray-200 rounded-xl p-4 mb-6 space-y-4 bg-gray-50">
              <h3 className="font-semibold text-sm text-gray-700">새 업체 계정 생성</h3>
              {error && <p className="text-xs text-red-500">{error}</p>}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">업체명 *</label>
                  <input {...register("name")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="예: 한국섬유" />
                  {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">업체코드 * (영문 대문자)</label>
                  <input {...register("company_code")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="예: KT001" />
                  {errors.company_code && <p className="text-xs text-red-500 mt-0.5">{errors.company_code.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">로그인 아이디 * (소문자)</label>
                  <input {...register("login_id")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="예: kt001" />
                  {errors.login_id && <p className="text-xs text-red-500 mt-0.5">{errors.login_id.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">비밀번호 * (8자 이상)</label>
                  <input type="password" {...register("password")} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  {errors.password && <p className="text-xs text-red-500 mt-0.5">{errors.password.message}</p>}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100">취소</button>
                <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {isSubmitting ? "생성 중..." : "계정 생성"}
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <p className="text-center text-sm text-gray-400 py-8">로딩 중...</p>
          ) : (
            <CompanyTable
              companies={companies}
              onToggleActive={handleToggleActive}
              onCredentialUpdated={fetchCompanies}
            />
          )}
        </div>
      </main>
    </div>
  );
}
