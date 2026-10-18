import { describe, it, expect } from "vitest";

/**
 * Quiz scoring formula and threshold evaluation helper
 */
export function calculateQuizScore(
  questions: Array<{ id: string; correctIndex: number }>,
  userAnswers: Record<string, number>,
  passingScore: number = 70
) {
  if (!questions || questions.length === 0) {
    return {
      scorePercent: 0,
      passed: false,
      correctCount: 0,
      totalQuestions: 0,
    };
  }

  let correctCount = 0;
  for (const q of questions) {
    if (userAnswers[q.id] === q.correctIndex) {
      correctCount += 1;
    }
  }

  const scorePercent = Math.round((correctCount / questions.length) * 100);
  const passed = scorePercent >= passingScore;

  return {
    scorePercent,
    passed,
    correctCount,
    totalQuestions: questions.length,
    passingScore,
  };
}

describe("Unit: Quiz Scoring & Assessment Threshold Invariants", () => {
  const sampleQuestions = [
    { id: "q1", correctIndex: 0 },
    { id: "q2", correctIndex: 2 },
    { id: "q3", correctIndex: 1 },
    { id: "q4", correctIndex: 3 },
  ];

  it("should calculate 100% score when all answers are correct and mark as passed", () => {
    const answers = { q1: 0, q2: 2, q3: 1, q4: 3 };
    const result = calculateQuizScore(sampleQuestions, answers, 70);
    expect(result.correctCount).toBe(4);
    expect(result.scorePercent).toBe(100);
    expect(result.passed).toBe(true);
  });

  it("should evaluate passing threshold strictly at the passingScore boundary", () => {
    // 3 out of 4 correct = 75% -> passed (threshold 70%)
    const passAnswers = { q1: 0, q2: 2, q3: 1, q4: 0 };
    const passResult = calculateQuizScore(sampleQuestions, passAnswers, 70);
    expect(passResult.scorePercent).toBe(75);
    expect(passResult.passed).toBe(true);

    // 2 out of 4 correct = 50% -> failed (threshold 70%)
    const failAnswers = { q1: 0, q2: 2, q3: 0, q4: 0 };
    const failResult = calculateQuizScore(sampleQuestions, failAnswers, 70);
    expect(failResult.scorePercent).toBe(50);
    expect(failResult.passed).toBe(false);
  });

  it("should handle rounding cleanly for fractional percentages", () => {
    const threeQuestions = [
      { id: "a", correctIndex: 1 },
      { id: "b", correctIndex: 1 },
      { id: "c", correctIndex: 1 },
    ];
    // 2 out of 3 = 66.666...% -> rounds to 67%
    const result = calculateQuizScore(threeQuestions, { a: 1, b: 1, c: 0 }, 67);
    expect(result.scorePercent).toBe(67);
    expect(result.passed).toBe(true);
  });

  it("should safely handle zero questions without NaN division errors", () => {
    const result = calculateQuizScore([], {}, 70);
    expect(result.scorePercent).toBe(0);
    expect(result.passed).toBe(false);
    expect(result.totalQuestions).toBe(0);
  });

  it("should score 0% when no answers match or answers are empty", () => {
    const result = calculateQuizScore(sampleQuestions, {}, 70);
    expect(result.correctCount).toBe(0);
    expect(result.scorePercent).toBe(0);
    expect(result.passed).toBe(false);
  });
});
