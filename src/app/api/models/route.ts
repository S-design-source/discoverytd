import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { modelCreateSchema } from "@/lib/validations/schedule";

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
      .from("models")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: { users } } = await adminSupabase.auth.admin.listUsers({ perPage: 1000 });
    const emailMap = new Map(users.map((u) => [u.id, u.email ?? ""]));

    const result = (data ?? []).map((m) => ({
      ...m,
      login_id: emailMap.get(m.id)?.replace("@discovery-company.internal", "") ?? "",
    }));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

const MODEL_COLORS = [
  "#ec4899","#f43f5e","#a855f7","#8b5cf6",
  "#06b6d4","#0ea5e9","#14b8a6","#f97316",
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
    const parsed = modelCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, login_id, password, color } = parsed.data;
    const email = `${login_id}@discovery-company.internal`;

    const adminSupabase = await createAdminClient();

    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { role: "model" },
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const randomColor = color ?? MODEL_COLORS[Math.floor(Math.random() * MODEL_COLORS.length)];
    const { error: modelError } = await adminSupabase
      .from("models")
      .insert([{ id: authData.user.id, name, color: randomColor }]);

    if (modelError) {
      await adminSupabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: modelError.message }, { status: 500 });
    }

    // profile role을 model로 업데이트
    await adminSupabase
      .from("profiles")
      .update({ role: "model" })
      .eq("id", authData.user.id);

    return NextResponse.json(
      { id: authData.user.id, name, login_id: email },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
