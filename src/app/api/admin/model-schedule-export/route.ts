import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

function calcHours(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const minutes = (eh * 60 + em) - (sh * 60 + sm);
  return Math.round((minutes / 60) * 100) / 100;
}

export async function GET(req: NextRequest) {
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
      .select("date, start_time, end_time, models(name)")
      .gte("date", from)
      .lte("date", to)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const rows = (data ?? []).map((s) => ({
      modelName: (s.models as unknown as { name: string } | null)?.name ?? "알 수 없음",
      date: s.date,
      hours: calcHours(s.start_time, s.end_time),
    }));

    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
