import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { generateFittingExcelBuffer } from "@/lib/generateFittingExcel";

function calcHours(start: string, end: string): number {
  const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const s = toMin(start);
  const e = toMin(end);
  const lunchOverlap = Math.max(0, Math.min(e, 780) - Math.max(s, 720)); // 12:00~13:00 공제
  return Math.round(((e - s - lunchOverlap) / 60) * 100) / 100;
}

export async function GET(req: NextRequest) {
  console.log("[EXPORT] route handler called - NEW VERSION with exceljs");
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!from || !to) {
      return NextResponse.json({ error: "from, to 파라미터가 필요합니다." }, { status: 400 });
    }

    const adminSupabase = await createAdminClient();

    const { data, error } = await adminSupabase
      .from("model_schedules")
      .select("date, start_time, end_time, models(name, hourly_rate)")
      .gte("date", from)
      .lte("date", to)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // 모델별 그룹핑
    const fromDate = new Date(from);
    const year = fromDate.getFullYear();
    const month = fromDate.getMonth() + 1;

    const modelMap = new Map<string, {
      name: string;
      hourly_rate: number | null;
      records: { date: string; day: number; hours: number }[];
    }>();

    for (const s of data ?? []) {
      const model = s.models as unknown as { name: string; hourly_rate: number | null } | null;
      const name = model?.name ?? "알 수 없음";
      const hourly_rate = model?.hourly_rate ?? null;
      const hours = calcHours(s.start_time, s.end_time);
      const day = new Date(s.date).getDate();

      if (!modelMap.has(name)) {
        modelMap.set(name, { name, hourly_rate, records: [] });
      }
      modelMap.get(name)!.records.push({ date: s.date, day, hours });
    }

    const exportData = {
      year,
      month,
      models: Array.from(modelMap.values()),
    };

    if (exportData.models.length === 0) {
      return NextResponse.json({ error: "해당 기간에 피팅 데이터가 없습니다." }, { status: 404 });
    }

    console.log("[EXPORT] calling generateFittingExcelBuffer, models:", exportData.models.length);
    const buffer = await generateFittingExcelBuffer(exportData);
    console.log("[EXPORT] buffer size:", buffer.length);
    const fileName = `${year}년 ${month}월 피팅업무확인서_월말정산.xlsx`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      },
    });
  } catch (err) {
    console.error("[EXPORT ERROR]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다.", detail: String(err) }, { status: 500 });
  }
}
