"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ModelScheduleForm from "@/components/model/ModelScheduleForm";
import { ModelScheduleSchemaType } from "@/lib/validations/schedule";
import { ModelSchedule } from "@/types";
import Link from "next/link";

export default function EditModelSchedulePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [schedule, setSchedule] = useState<ModelSchedule | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/model-schedules`)
      .then((r) => r.json())
      .then((data: ModelSchedule[]) => {
        const found = data.find((s) => s.id === id);
        if (found) setSchedule(found);
      });
  }, [id]);

  const handleSubmit = async (data: ModelScheduleSchemaType) => {
    setIsSubmitting(true);
    setError("");

    const res = await fetch(`/api/model-schedules/${id}`, {
      method: "PATCH",
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
        <h1 className="font-bold text-base text-gray-900">피팅 일정 수정</h1>
      </header>

      <main className="max-w-lg mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {error && (
            <div className="mb-4 bg-red-50 text-red-700 rounded-lg p-3 text-sm">{error}</div>
          )}
          {schedule ? (
            <ModelScheduleForm
              defaultValues={{
                date: schedule.date,
                start_time: schedule.start_time.slice(0, 5),
                end_time: schedule.end_time.slice(0, 5),
                content: schedule.content ?? "",
              }}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitLabel="수정 완료"
            />
          ) : (
            <p className="text-center text-sm text-gray-400 py-8">로딩 중...</p>
          )}
        </div>
      </main>
    </div>
  );
}
