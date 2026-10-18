import { describe, it, expect } from "vitest";

/**
 * Pure curriculum progress calculation engine
 */
export function calculateCourseProgress(
  totalLessons: number,
  completedLessons: number
): { progressPercent: number; isCompleted: boolean } {
  if (totalLessons <= 0) {
    return { progressPercent: 0, isCompleted: false };
  }

  const clampedCompleted = Math.max(0, Math.min(completedLessons, totalLessons));
  const rawPercent = (clampedCompleted / totalLessons) * 100;
  const progressPercent = Math.round(rawPercent * 10) / 10;
  const isCompleted = progressPercent >= 100;

  return { progressPercent, isCompleted };
}

describe("Unit: Curriculum Progress Calculations & Completion Rules", () => {
  it("should calculate 0% progress when no lessons have been completed", () => {
    const result = calculateCourseProgress(10, 0);
    expect(result.progressPercent).toBe(0);
    expect(result.isCompleted).toBe(false);
  });

  it("should calculate exact percentage progress for partial completion", () => {
    // 3 out of 10 lessons = 30%
    const res1 = calculateCourseProgress(10, 3);
    expect(res1.progressPercent).toBe(30);
    expect(res1.isCompleted).toBe(false);

    // 1 out of 3 lessons = 33.3%
    const res2 = calculateCourseProgress(3, 1);
    expect(res2.progressPercent).toBe(33.3);
    expect(res2.isCompleted).toBe(false);
  });

  it("should mark course as 100% completed only when completedLessons === totalLessons", () => {
    const result = calculateCourseProgress(8, 8);
    expect(result.progressPercent).toBe(100);
    expect(result.isCompleted).toBe(true);
  });

  it("should clamp progress strictly between 0% and 100% against corrupted counters", () => {
    // Excessive completed count (e.g. 15 completed out of 10)
    const clampedHigh = calculateCourseProgress(10, 15);
    expect(clampedHigh.progressPercent).toBe(100);
    expect(clampedHigh.isCompleted).toBe(true);

    // Negative completed count
    const clampedLow = calculateCourseProgress(10, -5);
    expect(clampedLow.progressPercent).toBe(0);
    expect(clampedLow.isCompleted).toBe(false);
  });

  it("should guard against divide-by-zero on empty courses (0 lessons)", () => {
    const result = calculateCourseProgress(0, 0);
    expect(result.progressPercent).toBe(0);
    expect(result.isCompleted).toBe(false);
  });
});
