"use client";

import { motion } from "framer-motion";
import { BarChart3, CalendarClock, Home, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { DIMENSIONS, QUESTIONS, SCALE_OPTIONS } from "@/lib/questionnaire";
import type { AnswerMap, DimensionId, ResponseDetail, ResponseListItem } from "@/lib/types";

type ReportViewProps = {
  response: ResponseListItem | ResponseDetail;
  showAnswers?: boolean;
  adminMode?: boolean;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function getAnswerLabel(score: number) {
  return SCALE_OPTIONS.find((option) => option.value === score)?.label ?? `${score} 分`;
}

function hasAnswers(response: ResponseListItem | ResponseDetail): response is ResponseDetail {
  return "answers" in response;
}

export function ReportView({ response, showAnswers = false, adminMode = false }: ReportViewProps) {
  const report = response.report;
  const dimensionScores = response.dimension_scores;

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl px-5 py-6 sm:px-8 lg:px-10">
      <header className="flex flex-col gap-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-moss focus-ring rounded-panel">
          <Home size={17} />
          返回问卷
        </Link>
        <Link
          href="/feedback"
          className="glass-button inline-flex min-h-11 items-center justify-center gap-2 rounded-panel px-4 text-sm font-semibold text-moss"
        >
          <ShieldCheck size={17} />
          反馈页
        </Link>
      </header>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: "easeOut" }}
        className="glass-panel mt-8 rounded-panel p-5 sm:p-8"
      >
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <p className="text-sm font-semibold tracking-[0.22em] text-coral">
              {adminMode ? "USER REPORT" : "PERSONAL REPORT"}
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-ink sm:text-5xl">
              {response.username} 的 FoMO 反馈
            </h1>
            <div className="glass-card mt-5 inline-flex items-center gap-2 rounded-panel px-4 py-3 text-sm text-moss">
              <CalendarClock size={17} />
              {formatDate(response.created_at)}
            </div>
            <p className="mt-6 text-base leading-8 text-moss">{report.summary}</p>
            <p className="glass-card mt-4 rounded-panel px-4 py-3 text-sm leading-6 text-moss">{report.disclaimer}</p>
          </div>

          <div className="glass-card rounded-panel p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-moss">总分</p>
                <div className="mt-2 flex items-end gap-3">
                  <span className="text-6xl font-semibold leading-none text-ink">{response.total_score}</span>
                  <span className="pb-2 text-sm font-semibold text-moss">/ 80</span>
                </div>
              </div>
              <span className="rounded-panel bg-jade/12 px-4 py-2 text-sm font-semibold text-jade">
                {report.totalLevelLabel}
              </span>
            </div>
            <div className="mt-6 space-y-4">
              {report.dimensionReports.map((dimensionReport) => (
                <div key={dimensionReport.id}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-ink">{dimensionReport.name}</span>
                    <span className="font-semibold text-moss">
                      {dimensionReport.score}/20 · {dimensionReport.levelLabel}
                    </span>
                  </div>
                  <div className="glass-track h-3 overflow-hidden rounded-full">
                    <motion.div
                      className="h-full rounded-full bg-jade"
                      initial={{ width: 0 }}
                      animate={{ width: `${(dimensionReport.score / 20) * 100}%` }}
                      transition={{ duration: 0.52, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <section className="mt-5 grid gap-4 md:grid-cols-2">
        {report.dimensionReports.map((dimensionReport, index) => (
          <motion.article
            key={dimensionReport.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.06 * index }}
            className="glass-panel rounded-panel p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-coral">
                  {DIMENSIONS.find((dimension) => dimension.id === dimensionReport.id)?.englishName}
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-ink">{dimensionReport.name}</h2>
              </div>
              <span className="glass-card rounded-panel px-3 py-2 text-sm font-semibold text-moss">
                {dimensionScores[dimensionReport.id]}/20
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-moss">{dimensionReport.feedback}</p>
          </motion.article>
        ))}
      </section>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.18 }}
        className="glass-panel mt-5 rounded-panel p-5 sm:p-6"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-panel bg-ink text-white">
            <BarChart3 size={20} />
          </span>
          <div>
            <h2 className="text-2xl font-semibold text-ink">主要关注维度</h2>
            <p className="text-sm text-moss">
              {report.strongestDimension.name} · {report.strongestDimension.score}/20
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-moss">{report.strongestDimension.feedback}</p>
      </motion.section>

      {showAnswers && hasAnswers(response) ? <AnswerDetail answers={response.answers} /> : null}
    </div>
  );
}

function AnswerDetail({ answers }: { answers: AnswerMap }) {
  return (
    <section className="glass-panel mt-5 rounded-panel p-5 sm:p-6">
      <h2 className="text-2xl font-semibold text-ink">逐题分数</h2>
      <div className="mt-5 space-y-5">
        {DIMENSIONS.map((dimension) => (
          <div key={dimension.id} className="glass-card rounded-panel p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-ink">{dimension.name}</h3>
              <span className="text-sm font-semibold text-moss">
                {QUESTIONS.filter((question) => question.dimensionId === dimension.id).reduce(
                  (sum, question) => sum + answers[question.id],
                  0
                )}
                /20
              </span>
            </div>
            <div className="space-y-3">
              {QUESTIONS.filter((question) => question.dimensionId === dimension.id).map((question) => (
                <div
                  key={question.id}
                  className="glass-card grid gap-3 rounded-panel p-3 text-sm sm:grid-cols-[4rem_1fr_9rem]"
                >
                  <span className="font-semibold text-jade">{question.id}</span>
                  <span className="leading-6 text-ink">{question.text}</span>
                  <span className="font-semibold text-moss">
                    {answers[question.id]} 分 · {getAnswerLabel(answers[question.id])}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
