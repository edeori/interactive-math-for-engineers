import { describe, expect, it } from "vitest";
import { loadCurriculum, validateCurriculum } from "../src";

describe("curriculum content", () => {
  it("has valid references and generated variants", () => {
    const curriculum = loadCurriculum();
    expect(validateCurriculum(curriculum)).toEqual([]);
    expect(curriculum.modules.length).toBe(8);
    expect(curriculum.lessons.length).toBeGreaterThanOrEqual(50);
    expect(curriculum.exercises.length).toBeGreaterThanOrEqual(50);
  });

  it("provides deep explanations and sufficient practice in the foundation module", () => {
    const curriculum = loadCurriculum();
    const foundationLessons = curriculum.lessons.filter(
      (lesson) => lesson.moduleId === "00-foundations",
    );
    expect(foundationLessons).toHaveLength(9);
    for (const lesson of foundationLessons) {
      expect(lesson.sections.length, lesson.id).toBeGreaterThanOrEqual(8);
      expect(
        lesson.exerciseTemplateIds.length,
        lesson.id,
      ).toBeGreaterThanOrEqual(5);
    }
    const diagnostic = foundationLessons.find(
      (lesson) => lesson.id === "00-diagnostic-number-sense",
    );
    expect(diagnostic?.exerciseTemplateIds.length).toBeGreaterThanOrEqual(10);
  });
});
