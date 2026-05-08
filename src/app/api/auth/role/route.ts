import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    let companyName: string | undefined;
    if (profile.role === "company") {
      const { data: company } = await supabase
        .from("companies")
        .select("name")
        .eq("id", user.id)
        .single();
      companyName = company?.name;
    }

    let modelName: string | undefined;
    if (profile.role === "model") {
      const { data: model } = await supabase
        .from("models")
        .select("name")
        .eq("id", user.id)
        .single();
      modelName = model?.name;
    }

    return NextResponse.json({ role: profile.role, companyName, modelName });
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
