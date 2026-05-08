import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { companyCreateSchema } from "@/lib/validations/schedule";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const adminSupabase = await createAdminClient();
    const { data, error } = await adminSupabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

const COMPANY_COLORS = [
  "#6366f1","#f59e0b","#10b981","#ef4444",
  "#8b5cf6","#f97316","#06b6d4","#84cc16",
];

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = companyCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, company_code, login_id, password, color } = parsed.data;
    const email = `${login_id}@discovery-company.internal`;

    const adminSupabase = await createAdminClient();

    // 1. Supabase Auth 유저 생성
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { role: "company" },
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // 2. companies 테이블에 업체 정보 삽입
    const randomColor = color ?? COMPANY_COLORS[Math.floor(Math.random() * COMPANY_COLORS.length)];
    const { error: companyError } = await adminSupabase
      .from("companies")
      .insert([{ id: authData.user.id, name, company_code, color: randomColor }]);

    if (companyError) {
      await adminSupabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: companyError.message }, { status: 500 });
    }

    return NextResponse.json(
      { id: authData.user.id, name, company_code, login_id: email },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
