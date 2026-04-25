"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ReportView } from "@/components/ReportView";
import type { ResponseDetail } from "@/lib/types";

export function FeedbackDetail({ id }: { id: string }) {
  const [response, setResponse] = useState<ResponseDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      setLoading(true);
      setError("");

      try {
        const result = await fetch(`/api/admin/responses/${id}`, { cache: "no-store" });
        const data = (await result.json()) as { response?: ResponseDetail; error?: string };

        if (result.status === 401) {
          setLocked(true);
          return;
        }

        if (!result.ok || !data.response) {
          throw new Error(data.error || "读取详情失败");
        }

        setResponse(data.response);
      } catch (detailError) {
        setError(detailError instanceof Error ? detailError.message : "读取详情失败");
      } finally {
        setLoading(false);
      }
    }

    void loadDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <div className="glass-panel flex items-center gap-3 rounded-panel p-5 text-moss">
          <Loader2 className="animate-spin" size={20} />
          正在读取用户详情
        </div>
      </div>
    );
  }

  if (locked) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl items-center px-5">
        <div className="glass-panel rounded-panel p-6">
          <h1 className="text-2xl font-semibold text-ink">需要管理口令</h1>
          <p className="mt-3 text-sm leading-6 text-moss">请先进入反馈页完成管理登录。</p>
          <Link
            href="/feedback"
            className="glass-button mt-5 inline-flex min-h-11 items-center rounded-panel px-4 text-sm font-semibold text-moss"
          >
            前往反馈页
          </Link>
        </div>
      </div>
    );
  }

  if (error || !response) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl items-center px-5">
        <div className="glass-panel rounded-panel p-6">
          <h1 className="text-2xl font-semibold text-ink">无法读取详情</h1>
          <p className="mt-3 text-sm leading-6 text-coral">{error || "没有找到这份记录"}</p>
          <Link
            href="/feedback"
            className="glass-button mt-5 inline-flex min-h-11 items-center rounded-panel px-4 text-sm font-semibold text-moss"
          >
            返回反馈页
          </Link>
        </div>
      </div>
    );
  }

  return <ReportView response={response} showAnswers adminMode />;
}
