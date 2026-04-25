import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "未登录或会话已过期" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("responses")
      .select("id, username, total_score, dimension_scores, report, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ responses: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "服务端配置错误" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "未登录或会话已过期" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体不是有效 JSON" }, { status: 400 });
  }

  const payload = body as { ids?: unknown };
  const ids =
    Array.isArray(payload.ids) && payload.ids.every((id) => typeof id === "string" && id.trim().length > 0)
      ? Array.from(new Set(payload.ids.map((id) => id.trim())))
      : [];

  if (ids.length === 0) {
    return NextResponse.json({ error: "请选择要删除的记录" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("responses").delete().in("id", ids);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ deletedIds: ids });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "服务端配置错误" },
      { status: 500 }
    );
  }
}
