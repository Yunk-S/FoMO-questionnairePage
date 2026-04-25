"use client";

import { Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ReportView } from "@/components/ReportView";
import type { ResponseDetail } from "@/lib/types";

export function FeedbackDetail({ id }: { id: string }) {
  const [response, setResponse] = useState<ResponseDetail | null>(null);
  const [password, setPassword] = useState("");
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadDetail(token = adminToken) {
    if (!token) {
      setResponse(null);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await fetch(`/api/admin/responses/${id}`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = (await result.json()) as { response?: ResponseDetail; error?: string };

      if (result.status === 401) {
        setAdminToken(null);
        setResponse(null);
        throw new Error("管理口令已过期，请重新输入");
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

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loginResult = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const loginData = (await loginResult.json()) as { error?: string; token?: string };

      if (!loginResult.ok || !loginData.token) {
        throw new Error(loginData.error || "登录失败");
      }

      setAdminToken(loginData.token);
      setPassword("");
      await loadDetail(loginData.token);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }

  if (!response) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-xl items-center px-5 py-10">
        <form onSubmit={handleLogin} className="glass-panel w-full rounded-panel p-6 sm:p-8">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-panel bg-ink text-white">
            <LockKeyhole size={24} />
          </div>
          <p className="text-sm font-semibold tracking-[0.2em] text-coral">ADMIN ACCESS</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">用户详情</h1>
          <p className="mt-3 text-sm leading-6 text-moss">请输入管理口令后查看这份答题记录。</p>
          <label className="mt-7 block text-sm font-semibold text-moss" htmlFor="admin-detail-password">
            管理口令
          </label>
          <input
            id="admin-detail-password"
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
            查看用户详情
          </button>
          <Link href="/feedback" className="mt-5 inline-block text-sm font-semibold text-moss focus-ring rounded-panel">
            返回反馈页
          </Link>
        </form>
      </div>
    );
  }

  return <ReportView response={response} showAnswers adminMode />;
}
