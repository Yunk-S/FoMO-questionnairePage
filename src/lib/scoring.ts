import { DIMENSIONS, QUESTION_IDS, QUESTIONS } from "@/lib/questionnaire";
import type {
  AnswerMap,
  DimensionId,
  DimensionReport,
  DimensionScoreMap,
  FomoReport,
  QuestionId,
  ScoreLevel
} from "@/lib/types";

export function createEmptyDimensionScores(): DimensionScoreMap {
  return Object.fromEntries(DIMENSIONS.map((dimension) => [dimension.id, 0])) as DimensionScoreMap;
}

export function getDimensionLevel(score: number): ScoreLevel {
  if (score <= 9) {
    return "low";
  }

  if (score <= 14) {
    return "medium";
  }

  return "high";
}

export function getTotalLevel(score: number): ScoreLevel {
  if (score <= 39) {
    return "low";
  }

  if (score <= 56) {
    return "medium";
  }

  return "high";
}

export function getLevelLabel(level: ScoreLevel): string {
  const labels: Record<ScoreLevel, string> = {
    low: "低倾向",
    medium: "中等倾向",
    high: "高倾向"
  };

  return labels[level];
}

export function scoreAnswers(answers: AnswerMap) {
  const dimensionScores = createEmptyDimensionScores();
  let totalScore = 0;

  for (const question of QUESTIONS) {
    const score = answers[question.id];
    dimensionScores[question.dimensionId] += score;
    totalScore += score;
  }

  return {
    totalScore,
    dimensionScores
  };
}

export function buildReport(dimensionScores: DimensionScoreMap, totalScore: number): FomoReport {
  const dimensionReports = DIMENSIONS.map<DimensionReport>((dimension) => {
    const score = dimensionScores[dimension.id];
    const level = getDimensionLevel(score);
    const feedbackByLevel: Record<ScoreLevel, string> = {
      low: dimension.lowFeedback,
      medium: dimension.mediumFeedback,
      high: dimension.highFeedback
    };

    return {
      id: dimension.id,
      name: dimension.name,
      score,
      level,
      levelLabel: getLevelLabel(level),
      feedback: feedbackByLevel[level]
    };
  });

  const totalLevel = getTotalLevel(totalScore);
  const strongestDimension = [...dimensionReports].sort((a, b) => b.score - a.score)[0];
  const summaries: Record<ScoreLevel, string> = {
    low: "你的 FoMO 总体水平较低，通常能较平稳地处理社交信息和朋友动态，不容易被错过感持续牵动。",
    medium: "你的 FoMO 总体水平处在中等区间，部分情境会激发比较、焦虑或检查行为，建议留意高分维度对应的触发场景。",
    high: "你的 FoMO 总体水平较高，社交媒体或朋友动态可能较频繁地影响你的情绪、认知和行为节奏。"
  };

  return {
    totalScore,
    totalLevel,
    totalLevelLabel: getLevelLabel(totalLevel),
    summary: summaries[totalLevel],
    dimensionReports,
    strongestDimension,
    disclaimer: "本报告仅用于心理测量课程、个人觉察和问卷统计反馈，不作为临床诊断或治疗建议。"
  };
}

export function isQuestionId(value: string): value is QuestionId {
  return QUESTION_IDS.includes(value as QuestionId);
}

export function validateAnswers(input: unknown): { answers: AnswerMap; error?: never } | { answers?: never; error: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { error: "答案格式不正确" };
  }

  const record = input as Record<string, unknown>;
  const normalized: Partial<AnswerMap> = {};

  for (const id of QUESTION_IDS) {
    const value = record[id];

    if (!Number.isInteger(value) || Number(value) < 1 || Number(value) > 5) {
      return { error: `题目 ${id} 的分数必须是 1 到 5 的整数` };
    }

    normalized[id] = Number(value);
  }

  const extraKeys = Object.keys(record).filter((key) => !isQuestionId(key));
  if (extraKeys.length > 0) {
    return { error: "答案中包含未知题目编号" };
  }

  return { answers: normalized as AnswerMap };
}

export function validateUsername(input: unknown): { username: string; error?: never } | { username?: never; error: string } {
  if (typeof input !== "string") {
    return { error: "请输入用户名" };
  }

  const username = input.trim();
  if (username.length < 1) {
    return { error: "请输入用户名" };
  }

  if (username.length > 40) {
    return { error: "用户名不能超过 40 个字符" };
  }

  return { username };
}

export function getDimensionName(id: DimensionId): string {
  return DIMENSIONS.find((dimension) => dimension.id === id)?.name ?? id;
}
