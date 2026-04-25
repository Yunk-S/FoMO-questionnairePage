export type DimensionId = "motivation" | "cognition" | "emotion" | "behavior";

export type ScoreLevel = "low" | "medium" | "high";

export type QuestionId =
  | "M1"
  | "M2"
  | "M3"
  | "M4"
  | "C1"
  | "C2"
  | "C3"
  | "C4"
  | "E1"
  | "E2"
  | "E3"
  | "E4"
  | "B1"
  | "B2"
  | "B3"
  | "B4";

export type AnswerMap = Record<QuestionId, number>;

export type DimensionScoreMap = Record<DimensionId, number>;

export interface DimensionDefinition {
  id: DimensionId;
  code: "M" | "C" | "E" | "B";
  name: string;
  englishName: string;
  shortName: string;
  description: string;
  lowFeedback: string;
  mediumFeedback: string;
  highFeedback: string;
}

export interface Question {
  id: QuestionId;
  dimensionId: DimensionId;
  text: string;
  core: string;
}

export interface DimensionReport {
  id: DimensionId;
  name: string;
  score: number;
  level: ScoreLevel;
  levelLabel: string;
  feedback: string;
}

export interface FomoReport {
  totalScore: number;
  totalLevel: ScoreLevel;
  totalLevelLabel: string;
  summary: string;
  dimensionReports: DimensionReport[];
  strongestDimension: DimensionReport;
  disclaimer: string;
}

export type ResponseListItem = {
  id: string;
  username: string;
  total_score: number;
  dimension_scores: DimensionScoreMap;
  report: FomoReport;
  created_at: string;
};

export type ResponseDetail = ResponseListItem & {
  answers: AnswerMap;
};
