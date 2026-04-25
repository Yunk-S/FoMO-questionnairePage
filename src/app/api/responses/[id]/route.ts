import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("responses")
      .select("id, username, total_score, dimension_scores, report, created_at")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "没有找到这份报告" }, { status: 404 });
    }

    return NextResponse.json({ response: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "服务器配置错误" },
      { status: 500 }
    );
  }
}
