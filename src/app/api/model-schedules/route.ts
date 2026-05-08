import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { modelScheduleSchema } from "@/lib/validations/schedule";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const date = searchParams.get("date");

    let query = supabase
      .from("model_schedules")
      .select("*, models(name, color)")
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (date) {
      query = query.eq("date", date);
    } else if (month) {
      query = query
        .gte("date", `${month}-01`)
        .lte("date", `${month}-31`);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = modelScheduleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("model_schedules")
      .insert([{ ...parsed.data, model_id: user.id }])
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
