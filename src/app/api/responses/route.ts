import { NextResponse } from "next/server";
import { buildReport, scoreAnswers, validateAnswers, validateUsername } from "@/lib/scoring";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体不是有效 JSON" }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const usernameResult = validateUsername(payload.username);
  if ("error" in usernameResult) {
    return NextResponse.json({ error: usernameResult.error }, { status: 400 });
  }

  const answersResult = validateAnswers(payload.answers);
  if ("error" in answersResult) {
    return NextResponse.json({ error: answersResult.error }, { status: 400 });
  }

  const { totalScore, dimensionScores } = scoreAnswers(answersResult.answers);
  const report = buildReport(dimensionScores, totalScore);

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("responses")
      .insert({
        username: usernameResult.username,
        answers: answersResult.answers,
        dimension_scores: dimensionScores,
        total_score: totalScore,
        report
      })
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? "保存答题记录失败" }, { status: 500 });
    }

    const eventResult = await supabase.from("response_events").insert({ response_id: data.id });
    if (eventResult.error) {
      return NextResponse.json({ error: eventResult.error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "服务器配置错误" },
      { status: 500 }
    );
  }
}
