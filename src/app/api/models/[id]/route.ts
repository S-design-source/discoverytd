import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const adminSupabase = await createAdminClient();

    if (body.login_id !== undefined || body.password !== undefined) {
      const authUpdates: { email?: string; password?: string } = {};
      if (body.login_id) authUpdates.email = `${body.login_id}@discovery-company.internal`;
      if (body.password) authUpdates.password = body.password;

      const { error: authError } = await adminSupabase.auth.admin.updateUserById(id, authUpdates);
      if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const dbUpdates: Record<string, unknown> = {};
    if (body.is_active !== undefined) dbUpdates.is_active = body.is_active;
    if (body.hourly_rate !== undefined) dbUpdates.hourly_rate = body.hourly_rate;

    if (Object.keys(dbUpdates).length > 0) {
      const { error } = await adminSupabase
        .from("models")
        .update(dbUpdates)
        .eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
