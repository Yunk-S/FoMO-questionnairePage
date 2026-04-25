import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: RouteParams) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "未登录或会话已过期" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("responses").select("*").eq("id", id).single();

    if (error || !data) {
      return NextResponse.json({ error: "没有找到这份答题记录" }, { status: 404 });
    }

    return NextResponse.json({ response: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "服务器配置错误" },
      { status: 500 }
    );
  }
}
