import { describe, expect, it } from "vitest";
import type { ExerciseTemplate } from "@repo/shared-types";
import { evaluateExpression, generateExercise, validateAnswer } from "../src";

const template: ExerciseTemplate = {
  id: "decay-test",
  version: 1,
  title: "Decay",
  skillIds: ["exponential-functions"],
  difficulty: 2,
  context: "audio",
  parameters: {
    initial: { type: "integer", min: 2, max: 10 },
    tau: { type: "decimal", min: 0.2, max: 2, step: 0.1 },
    time: { type: "decimal", min: 0.1, max: 3, step: 0.1 },
  },
  promptTemplate: "A={{initial}}, tau={{tau}}, t={{time}}",
  answerType: "numeric",
  solution: { type: "formula", expression: "initial * exp(-time / tau)" },
  hints: [],
  validators: [
    {
      type: "numeric-tolerance",
      absoluteTolerance: 0.001,
      relativeTolerance: 0,
    },
  ],
};

describe("exercise engine", () => {
  it("is deterministic for a template version and seed", () => {
    expect(generateExercise(template, "learner-42")).toEqual(
      generateExercise(template, "learner-42"),
    );
  });

  it("creates different parameter sets for different seeds", () => {
    const first = generateExercise(template, "alpha");
    const second = generateExercise(template, "bravo");
    expect(first.generatedParameters).not.toEqual(second.generatedParameters);
  });

  it("accepts the generated expected answer", () => {
    const exercise = generateExercise(template, "test");
    expect(
      validateAnswer(template, exercise, exercise.expectedAnswer).correct,
    ).toBe(true);
  });

  it("evaluates only whitelisted mathematical expressions", () => {
    expect(
      evaluateExpression("2 * exp(-time / tau)", { time: 1, tau: 2 }),
    ).toBeCloseTo(2 * Math.exp(-0.5));
    expect(() => evaluateExpression("process.exit()", {})).toThrow();
  });
});
