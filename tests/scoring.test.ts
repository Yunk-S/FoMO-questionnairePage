import { describe, expect, it } from "vitest";
import { QUESTION_IDS } from "@/lib/questionnaire";
import { buildReport, getDimensionLevel, scoreAnswers, validateAnswers } from "@/lib/scoring";
import type { AnswerMap } from "@/lib/types";

function answersWith(score: number): AnswerMap {
  return Object.fromEntries(QUESTION_IDS.map((id) => [id, score])) as AnswerMap;
}

describe("FoMO scoring", () => {
  it("scores all-one answers as the lowest total and dimension scores", () => {
    const { totalScore, dimensionScores } = scoreAnswers(answersWith(1));
    const report = buildReport(dimensionScores, totalScore);

    expect(totalScore).toBe(16);
    expect(Object.values(dimensionScores)).toEqual([4, 4, 4, 4]);
    expect(report.totalLevel).toBe("low");
    expect(report.dimensionReports.every((dimension) => dimension.level === "low")).toBe(true);
  });

  it("scores all-five answers as the highest total and dimension scores", () => {
    const { totalScore, dimensionScores } = scoreAnswers(answersWith(5));
    const report = buildReport(dimensionScores, totalScore);

    expect(totalScore).toBe(80);
    expect(Object.values(dimensionScores)).toEqual([20, 20, 20, 20]);
    expect(report.totalLevel).toBe("high");
    expect(report.dimensionReports.every((dimension) => dimension.level === "high")).toBe(true);
  });

  it("classifies dimension boundary scores", () => {
    expect(getDimensionLevel(9)).toBe("low");
    expect(getDimensionLevel(10)).toBe("medium");
    expect(getDimensionLevel(14)).toBe("medium");
    expect(getDimensionLevel(15)).toBe("high");
  });

  it("rejects missing and out-of-range answers", () => {
    expect(validateAnswers({ ...answersWith(3), M1: 0 }).error).toBeTruthy();
    expect(validateAnswers({ ...answersWith(3), M1: 6 }).error).toBeTruthy();
    expect(validateAnswers({ M1: 3 }).error).toBeTruthy();
  });
});
