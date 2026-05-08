"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ModelScheduleForm from "@/components/model/ModelScheduleForm";
import { ModelScheduleSchemaType } from "@/lib/validations/schedule";
import Link from "next/link";

export default function NewModelSchedulePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (data: ModelScheduleSchemaType) => {
    setIsSubmitting(true);
    setError("");

    const res = await fetch("/api/model-schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "오류가 발생했습니다.");
      setIsSubmitting(false);
      return;
    }

    router.push("/model");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-3 flex items-center gap-3">
        <Link href="/model" className="text-gray-500 hover:text-gray-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="font-bold text-base text-gray-900">피팅 일정 등록</h1>
      </header>

      <main className="max-w-lg mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {error && (
            <div className="mb-4 bg-red-50 text-red-700 rounded-lg p-3 text-sm">{error}</div>
          )}
          <ModelScheduleForm onSubmit={handleSubmit} isSubmitting={isSubmitting} submitLabel="일정 등록" />
        </div>
      </main>
    </div>
  );
}
