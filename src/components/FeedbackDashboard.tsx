"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  CheckSquare,
  Clock,
  Eye,
  Loader2,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Square,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DIMENSIONS } from "@/lib/questionnaire";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { ResponseListItem } from "@/lib/types";

type LoadState = "locked" | "ready" | "error";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function FeedbackDashboard() {
  const [state, setState] = useState<LoadState>("locked");
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [records, setRecords] = useState<ResponseListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState("等待连接");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  const loadResponses = useCallback(
    async (token = adminToken) => {
      if (!token) {
        setRecords([]);
        setSelectedIds([]);
        setState("locked");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/admin/responses", {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = (await response.json()) as { responses?: ResponseListItem[]; error?: string };

        if (response.status === 401) {
          setAdminToken(null);
          setState("locked");
          setRecords([]);
          setSelectedIds([]);
          return;
        }

        if (!response.ok) {
          throw new Error(data.error || "读取统计失败");
        }

        const nextRecords = data.responses ?? [];
        setRecords(nextRecords);
        setSelectedIds((current) => current.filter((id) => nextRecords.some((record) => record.id === id)));
        setState("ready");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "读取统计失败");
        setState("error");
      } finally {
        setLoading(false);
      }
    },
    [adminToken]
  );

  useEffect(() => {
    if (state !== "ready" || !adminToken) {
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
        void loadResponses(adminToken);
      })
      .subscribe((status) => {
        setRealtimeStatus(status === "SUBSCRIBED" ? "实时同步中" : "连接中");
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [adminToken, loadResponses, state]);

  const stats = useMemo(() => {
    const count = records.length;
    const total = records.reduce((sum, record) => sum + record.total_score, 0);
    const average = count > 0 ? Math.round((total / count) * 10) / 10 : 0;
    const highCount = records.filter((record) => record.report.totalLevel === "high").length;

    return { count, average, highCount };
  }, [records]);

  const isAllSelected = records.length > 0 && selectedIds.length === records.length;
  const isDeleting = deletingIds.length > 0;

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
      const data = (await response.json()) as { error?: string; token?: string };

      if (!response.ok || !data.token) {
        throw new Error(data.error || "登录失败");
      }

      setAdminToken(data.token);
      setPassword("");
      await loadResponses(data.token);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "登录失败");
      setState("locked");
    } finally {
      setLoading(false);
    }
  }

  function toggleSelectAll() {
    setSelectedIds(isAllSelected ? [] : records.map((record) => record.id));
  }

  function toggleSelectOne(id: string) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  async function deleteRecords(ids: string[]) {
    if (!adminToken || ids.length === 0) {
      return;
    }

    setDeletingIds(ids);
    setError("");

    try {
      const response = await fetch("/api/admin/responses", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ ids })
      });
      const data = (await response.json()) as { deletedIds?: string[]; error?: string };

      if (response.status === 401) {
        setAdminToken(null);
        setState("locked");
        setRecords([]);
        setSelectedIds([]);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "删除记录失败");
      }

      setRecords((current) => current.filter((record) => !ids.includes(record.id)));
      setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "删除记录失败");
    } finally {
      setDeletingIds([]);
    }
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
            className="glass-field focus-ring mt-2 h-14 w-full rounded-panel px-4 text-ink outline-none"
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
          <Link href="/" className="focus-ring mt-5 inline-block rounded-panel text-sm font-semibold text-moss">
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
        <div className="soft-divider flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold text-ink">答题记录</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={toggleSelectAll}
              disabled={records.length === 0 || isDeleting}
              className="glass-button inline-flex min-h-10 items-center justify-center gap-2 rounded-panel px-4 text-sm font-semibold text-moss disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAllSelected ? <CheckSquare size={16} /> : <Square size={16} />}
              {isAllSelected ? "取消全选" : "全选"}
            </button>
            <button
              type="button"
              onClick={() => void deleteRecords(selectedIds)}
              disabled={selectedIds.length === 0 || isDeleting}
              className="glass-button inline-flex min-h-10 items-center justify-center gap-2 rounded-panel px-4 text-sm font-semibold text-coral disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting && selectedIds.every((id) => deletingIds.includes(id)) ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              删除选中
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-white/20 text-moss backdrop-blur-md">
              <tr>
                <th className="px-5 py-4 font-semibold">选择</th>
                <th className="px-5 py-4 font-semibold">用户</th>
                <th className="px-5 py-4 font-semibold">提交时间</th>
                <th className="px-5 py-4 font-semibold">总分</th>
                {DIMENSIONS.map((dimension) => (
                  <th key={dimension.id} className="px-5 py-4 font-semibold">
                    {dimension.shortName}
                  </th>
                ))}
                <th className="px-5 py-4 font-semibold">报告摘要</th>
                <th className="px-5 py-4 font-semibold">操作</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-center text-moss" colSpan={10}>
                    暂无答题记录
                  </td>
                </tr>
              ) : (
                records.map((record) => {
                  const checked = selectedIds.includes(record.id);
                  const deleting = deletingIds.includes(record.id);

                  return (
                    <tr key={record.id} className="soft-divider border-t align-top">
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => toggleSelectOne(record.id)}
                          disabled={deleting || isDeleting}
                          className="glass-button inline-flex h-10 w-10 items-center justify-center rounded-panel text-moss disabled:cursor-not-allowed disabled:opacity-50"
                          aria-pressed={checked}
                          aria-label={checked ? "取消选择" : "选择记录"}
                        >
                          {checked ? <CheckSquare size={16} /> : <Square size={16} />}
                        </button>
                      </td>
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
                        <div className="flex gap-2">
                          <Link
                            href={`/feedback/${record.id}`}
                            className="glass-button inline-flex min-h-10 items-center gap-2 rounded-panel px-3 font-semibold text-moss"
                          >
                            <Eye size={16} />
                            查看
                          </Link>
                          <button
                            type="button"
                            onClick={() => void deleteRecords([record.id])}
                            disabled={deleting || isDeleting}
                            className="glass-button inline-flex min-h-10 items-center gap-2 rounded-panel px-3 font-semibold text-coral disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
