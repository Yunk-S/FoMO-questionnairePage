"use client";

import { motion } from "framer-motion";
import { BarChart3, Clock, Eye, Loader2, LockKeyhole, RefreshCw, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DIMENSIONS } from "@/lib/questionnaire";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { ResponseListItem } from "@/lib/types";

type LoadState = "checking" | "locked" | "ready" | "error";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function FeedbackDashboard() {
  const [state, setState] = useState<LoadState>("checking");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [records, setRecords] = useState<ResponseListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState("等待连接");

  const loadResponses = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/responses", { cache: "no-store" });
      const data = (await response.json()) as { responses?: ResponseListItem[]; error?: string };

      if (response.status === 401) {
        setState("locked");
        setRecords([]);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "读取统计失败");
      }

      setRecords(data.responses ?? []);
      setState("ready");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "读取统计失败");
      setState("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadResponses();
  }, [loadResponses]);

  useEffect(() => {
    if (state !== "ready") {
      return;
    }

    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setRealtimeStatus("环境变量未配置");
      return;
    }

    const channel = supabase
      .channel("response-events")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "response_events" }, () => {
        setRealtimeStatus("收到新记录");
        void loadResponses();
      })
      .subscribe((status) => {
        setRealtimeStatus(status === "SUBSCRIBED" ? "实时同步中" : "连接中");
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadResponses, state]);

  const stats = useMemo(() => {
    const count = records.length;
    const total = records.reduce((sum, record) => sum + record.total_score, 0);
    const average = count > 0 ? Math.round((total / count) * 10) / 10 : 0;
    const highCount = records.filter((record) => record.report.totalLevel === "high").length;

    return { count, average, highCount };
  }, [records]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "登录失败");
      }

      setPassword("");
      await loadResponses();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "登录失败");
      setState("locked");
    } finally {
      setLoading(false);
    }
  }

  if (state === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <div className="glass-panel flex items-center gap-3 rounded-panel p-5 text-moss">
          <Loader2 className="animate-spin" size={20} />
          正在读取反馈页
        </div>
      </div>
    );
  }

  if (state === "locked") {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-xl items-center px-5 py-10">
        <form onSubmit={handleLogin} className="glass-panel w-full rounded-panel p-6 sm:p-8">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-panel bg-ink text-white">
            <LockKeyhole size={24} />
          </div>
          <p className="text-sm font-semibold tracking-[0.2em] text-coral">ADMIN ACCESS</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">反馈统计页</h1>
          <label className="mt-7 block text-sm font-semibold text-moss" htmlFor="admin-password">
            管理口令
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="focus-ring mt-2 h-14 w-full rounded-panel border border-white/70 bg-white/60 px-4 text-ink outline-none backdrop-blur"
          />
          {error ? <p className="mt-4 rounded-panel bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="glass-button mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-panel px-5 font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
            进入反馈页
          </button>
          <Link href="/" className="mt-5 inline-block text-sm font-semibold text-moss focus-ring rounded-panel">
            返回问卷
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
      <header className="flex flex-col gap-4 py-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.22em] text-coral">LIVE FEEDBACK</p>
          <h1 className="mt-2 text-4xl font-semibold text-ink">问卷反馈统计</h1>
          <p className="mt-3 text-sm text-moss">实时状态：{realtimeStatus}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="glass-button inline-flex min-h-11 items-center justify-center rounded-panel px-4 text-sm font-semibold text-moss"
          >
            返回问卷
          </Link>
          <button
            type="button"
            onClick={() => void loadResponses()}
            className="glass-button inline-flex min-h-11 items-center justify-center gap-2 rounded-panel px-4 text-sm font-semibold text-moss"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            刷新
          </button>
        </div>
      </header>

      {error ? <p className="mt-5 rounded-panel bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p> : null}

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard icon={<BarChart3 size={22} />} label="提交人数" value={stats.count.toString()} />
        <StatCard icon={<Clock size={22} />} label="平均总分" value={stats.average.toString()} />
        <StatCard icon={<ShieldCheck size={22} />} label="高倾向人数" value={stats.highCount.toString()} />
      </section>

      <section className="glass-panel mt-5 overflow-hidden rounded-panel">
        <div className="border-b soft-divider p-5">
          <h2 className="text-2xl font-semibold text-ink">答题记录</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse text-left text-sm">
            <thead className="bg-white/50 text-moss">
              <tr>
                <th className="px-5 py-4 font-semibold">用户</th>
                <th className="px-5 py-4 font-semibold">提交时间</th>
                <th className="px-5 py-4 font-semibold">总分</th>
                {DIMENSIONS.map((dimension) => (
                  <th key={dimension.id} className="px-5 py-4 font-semibold">
                    {dimension.shortName}
                  </th>
                ))}
                <th className="px-5 py-4 font-semibold">报告摘要</th>
                <th className="px-5 py-4 font-semibold">详情</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-center text-moss" colSpan={9}>
                    暂无答题记录
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="border-t soft-divider align-top">
                    <td className="px-5 py-4 font-semibold text-ink">{record.username}</td>
                    <td className="px-5 py-4 text-moss">{formatDate(record.created_at)}</td>
                    <td className="px-5 py-4 font-semibold text-ink">
                      {record.total_score}
                      <span className="ml-1 text-xs text-moss">/80</span>
                    </td>
                    {DIMENSIONS.map((dimension) => (
                      <td key={dimension.id} className="px-5 py-4 text-moss">
                        {record.dimension_scores[dimension.id]}/20
                      </td>
                    ))}
                    <td className="max-w-xs px-5 py-4 leading-6 text-moss">{record.report.summary}</td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/feedback/${record.id}`}
                        className="glass-button inline-flex min-h-10 items-center gap-2 rounded-panel px-3 font-semibold text-moss"
                      >
                        <Eye size={16} />
                        查看
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className="glass-panel rounded-panel p-5"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-panel bg-jade/14 text-jade">{icon}</span>
        <span className="text-sm font-semibold text-moss">{label}</span>
      </div>
      <div className="mt-5 text-4xl font-semibold text-ink">{value}</div>
    </motion.article>
  );
}
