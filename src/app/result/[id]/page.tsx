import Link from "next/link";
import { notFound } from "next/navigation";
import { ReportView } from "@/components/ReportView";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { ResponseListItem } from "@/lib/types";

type ResultPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

async function getResponse(id: string): Promise<{ response?: ResponseListItem; setupError?: string }> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("responses")
      .select("id, username, total_score, dimension_scores, report, created_at")
      .eq("id", id)
      .single();

    if (error || !data) {
      return {};
    }

    return { response: data as ResponseListItem };
  } catch (error) {
    return { setupError: error instanceof Error ? error.message : "服务器配置错误" };
  }
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { id } = await params;
  const { response, setupError } = await getResponse(id);

  if (setupError) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl items-center px-5">
        <div className="glass-panel rounded-panel p-6">
          <p className="text-sm font-semibold tracking-[0.22em] text-coral">SETUP REQUIRED</p>
          <h1 className="mt-2 text-2xl font-semibold text-ink">Supabase 尚未配置</h1>
          <p className="mt-3 text-sm leading-6 text-moss">{setupError}</p>
          <Link
            href="/"
            className="glass-button mt-5 inline-flex min-h-11 items-center rounded-panel px-4 text-sm font-semibold text-moss"
          >
            返回问卷
          </Link>
        </div>
      </div>
    );
  }

  if (!response) {
    notFound();
  }

  return <ReportView response={response} />;
}
