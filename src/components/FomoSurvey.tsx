"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ClipboardList, Loader2, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DIMENSIONS, QUESTIONS, SCALE_OPTIONS } from "@/lib/questionnaire";
import type { AnswerMap, DimensionId, QuestionId } from "@/lib/types";

type DraftAnswers = Partial<AnswerMap>;

function getAnsweredCount(answers: DraftAnswers) {
  return QUESTIONS.filter((question) => typeof answers[question.id] === "number").length;
}

function getDimensionDraftScore(answers: DraftAnswers, dimensionId: DimensionId) {
  return QUESTIONS.filter((question) => question.dimensionId === dimensionId).reduce(
    (sum, question) => sum + (answers[question.id] ?? 0),
    0
  );
}

function hasCompleteAnswers(answers: DraftAnswers): answers is AnswerMap {
  return QUESTIONS.every((question) => Number.isInteger(answers[question.id]));
}

export function FomoSurvey() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<DraftAnswers>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const answeredCount = getAnsweredCount(answers);
  const progress = Math.round((answeredCount / QUESTIONS.length) * 100);
  const unansweredCount = QUESTIONS.length - answeredCount;

  const questionsByDimension = useMemo(
    () =>
      DIMENSIONS.map((dimension) => ({
        ...dimension,
        questions: QUESTIONS.filter((question) => question.dimensionId === dimension.id)
      })),
    []
  );

  function handleStart(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = username.trim();

    if (!trimmed) {
      setError("请输入用户名后开始答题");
      return;
    }

    setUsername(trimmed);
    setError("");
    setStarted(true);
  }

  function selectAnswer(questionId: QuestionId, score: number) {
    setAnswers((current) => ({ ...current, [questionId]: score }));
  }

  async function submitAnswers() {
    setError("");

    if (!hasCompleteAnswers(answers)) {
      setError("请完成所有题目后提交");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          answers
        })
      });
      const data = (await response.json()) as { id?: string; error?: string };

      if (!response.ok || !data.id) {
        throw new Error(data.error || "提交失败");
      }

      router.push(`/result/${data.id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "提交失败，请稍后重试");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
      <header className="flex items-center justify-between gap-4 py-2">
        <Link href="/" className="flex items-center gap-3 focus-ring rounded-panel">
          <span className="flex h-11 w-11 items-center justify-center rounded-panel bg-ink text-white shadow-soft">
            <ClipboardList size={20} />
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-[0.18em] text-moss">FOMO SCALE</span>
            <span className="block text-lg font-semibold text-ink">错失恐惧量表</span>
          </span>
        </Link>
        <Link
          href="/feedback"
          className="glass-button inline-flex min-h-11 items-center gap-2 rounded-panel px-4 text-sm font-semibold text-moss"
        >
          <ShieldCheck size={17} />
          反馈页
        </Link>
      </header>

      <AnimatePresence mode="wait">
        {!started ? (
          <motion.section
            key="intro"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr]"
          >
            <div className="max-w-2xl">
              <p className="mb-5 text-sm font-semibold tracking-[0.26em] text-coral">FEAR OF MISSING OUT</p>
              <h1 className="text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
                社交媒体情境下的 FoMO 倾向测评
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-moss sm:text-lg">
                16 道题，覆盖错失动机、错失认知、错失情绪和错失行为四个维度。提交后会生成个人报告，并进入后台统计。
              </p>
              <div className="mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
                {DIMENSIONS.map((dimension) => (
                  <div key={dimension.id} className="glass-panel rounded-panel p-4">
                    <div className="text-2xl font-semibold text-ink">{dimension.code}</div>
                    <div className="mt-1 text-sm text-moss">{dimension.shortName}</div>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleStart} className="glass-panel rounded-panel p-5 sm:p-7">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-panel bg-jade text-white shadow-soft">
                <UserRound size={25} />
              </div>
              <h2 className="text-2xl font-semibold text-ink">输入用户名</h2>
              <label className="mt-6 block text-sm font-semibold text-moss" htmlFor="username">
                用户名
              </label>
              <input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                maxLength={40}
                className="glass-field focus-ring mt-2 h-14 w-full rounded-panel px-4 text-lg text-ink outline-none"
                placeholder="例如：小陈"
              />
              {error ? <p className="mt-4 rounded-panel bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p> : null}
              <button
                type="submit"
                className="glass-button mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-panel px-5 text-base font-semibold text-ink"
              >
                开始答题
                <ArrowRight size={18} />
              </button>
            </form>
          </motion.section>
        ) : (
          <motion.section
            key="survey"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            className="py-8"
          >
            <div className="glass-panel sticky top-4 z-10 rounded-panel p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-moss">答题用户</p>
                  <h2 className="text-2xl font-semibold text-ink">{username}</h2>
                </div>
                <div className="text-sm font-semibold text-moss">
                  已完成 {answeredCount}/{QUESTIONS.length}，还剩 {unansweredCount} 题
                </div>
              </div>
              <div className="glass-track mt-4 h-3 overflow-hidden rounded-full">
                <motion.div
                  className="h-full rounded-full bg-jade"
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                />
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {questionsByDimension.map((dimension, index) => (
                <motion.section
                  key={dimension.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.28, delay: index * 0.04 }}
                  className="glass-panel rounded-panel p-4 sm:p-6"
                >
                  <div className="flex flex-col gap-3 border-b soft-divider pb-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold tracking-[0.18em] text-coral">{dimension.englishName}</p>
                      <h3 className="mt-1 text-2xl font-semibold text-ink">{dimension.name}</h3>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-moss">{dimension.description}</p>
                    </div>
                    <div className="glass-card rounded-panel px-4 py-3 text-sm font-semibold text-moss">
                      当前 {getDimensionDraftScore(answers, dimension.id)}/20
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    {dimension.questions.map((question) => (
                      <article key={question.id} className="glass-card rounded-panel p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-jade">{question.id}</p>
                            <p className="mt-1 text-base leading-7 text-ink">{question.text}</p>
                          </div>
                          {answers[question.id] ? (
                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-jade">
                              <CheckCircle2 size={16} />
                              {answers[question.id]} 分
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-5">
                          {SCALE_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              data-selected={answers[question.id] === option.value}
                              onClick={() => selectAnswer(question.id, option.value)}
                              className="glass-button flex min-h-16 flex-col items-center justify-center rounded-panel px-3 py-3 text-center"
                              aria-pressed={answers[question.id] === option.value}
                            >
                              <span className="text-xl font-semibold">{option.value}</span>
                              <span className="mt-1 text-xs font-semibold leading-4">{option.label}</span>
                            </button>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </motion.section>
              ))}
            </div>

            {error ? <p className="mt-5 rounded-panel bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p> : null}

            <div className="mt-6 flex flex-col items-stretch justify-end gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="glass-button rounded-panel px-5 py-4 text-sm font-semibold text-moss"
              >
                返回顶部
              </button>
              <button
                type="button"
                disabled={submitting || !hasCompleteAnswers(answers)}
                onClick={submitAnswers}
                className="glass-button inline-flex min-h-14 items-center justify-center gap-2 rounded-panel bg-jade/20 px-8 text-base font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
                提交并生成报告
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
