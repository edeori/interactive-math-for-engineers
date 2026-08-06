import type {
  ExerciseInstance,
  ExerciseTemplate,
  PublicExerciseInstance,
  ValidationResult,
} from "@repo/shared-types";
import { evaluateExpression } from "./expression";

function hashText(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRandom(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function pickAllowed(
  candidates: Array<number | string>,
  random: () => number,
): number | string {
  if (candidates.length === 0)
    throw new Error("Parameter has no allowed values");
  const index = Math.floor(random() * candidates.length);
  const selected = candidates[index];
  if (selected === undefined)
    throw new Error("Could not select parameter value");
  return selected;
}

function numericParameters(
  parameters: Record<string, number | string>,
): Record<string, number> {
  return Object.fromEntries(
    Object.entries(parameters).flatMap(([key, value]) =>
      typeof value === "number" ? [[key, value]] : [],
    ),
  );
}

export function generateExercise(
  template: ExerciseTemplate,
  seed: string,
): ExerciseInstance {
  const identity = `${template.id}:${template.version}:${seed}`;
  const random = createRandom(hashText(identity));
  const parameters: Record<string, number | string> = {};

  for (const [name, definition] of Object.entries(template.parameters)) {
    if (definition.type === "derived") continue;
    if (definition.type === "choice") {
      parameters[name] = pickAllowed(definition.choices, random);
      continue;
    }

    const excluded = new Set(definition.exclude ?? []);
    const values: number[] = [];
    if (definition.type === "integer") {
      for (let value = definition.min; value <= definition.max; value += 1) {
        if (!excluded.has(value)) values.push(value);
      }
    } else {
      const steps = Math.floor(
        (definition.max - definition.min) / definition.step + 1e-9,
      );
      for (let index = 0; index <= steps; index += 1) {
        const value = Number(
          (definition.min + index * definition.step).toFixed(12),
        );
        if (!excluded.has(value)) values.push(value);
      }
    }
    parameters[name] = pickAllowed(values, random);
  }

  for (const [name, definition] of Object.entries(template.parameters)) {
    if (definition.type !== "derived") continue;
    const value = evaluateExpression(
      definition.expression,
      numericParameters(parameters),
    );
    parameters[name] =
      definition.decimals === undefined
        ? value
        : Number(value.toFixed(definition.decimals));
  }

  const expectedAnswer =
    template.solution.type === "value"
      ? template.solution.value
      : evaluateExpression(
          template.solution.expression,
          numericParameters(parameters),
        );

  const renderedPrompt = template.promptTemplate.replace(
    /{{\s*([A-Za-z_][A-Za-z0-9_]*)\s*}}/g,
    (_, name: string) => {
      const value = parameters[name];
      if (value === undefined)
        throw new Error(`Prompt references unknown parameter: ${name}`);
      return String(value);
    },
  );

  const timestamp =
    Date.UTC(2025, 0, 1) + (hashText(identity) % 31_536_000) * 1000;
  return {
    id: `${template.id}-v${template.version}-${hashText(identity).toString(16)}`,
    templateId: template.id,
    templateVersion: template.version,
    seed,
    generatedParameters: parameters,
    renderedPrompt,
    expectedAnswer,
    createdAt: new Date(timestamp).toISOString(),
  };
}

export function toPublicExercise(
  instance: ExerciseInstance,
  template: ExerciseTemplate,
): PublicExerciseInstance {
  return {
    id: instance.id,
    templateId: instance.templateId,
    templateVersion: instance.templateVersion,
    seed: instance.seed,
    generatedParameters: instance.generatedParameters,
    renderedPrompt: instance.renderedPrompt,
    createdAt: instance.createdAt,
    title: template.title,
    answerType: template.answerType,
    ...(template.options ? { options: template.options } : {}),
    hints: template.hints,
    ...(template.unit ? { unit: template.unit } : {}),
  };
}

export function validateAnswer(
  template: ExerciseTemplate,
  instance: ExerciseInstance,
  answer: unknown,
): ValidationResult {
  const validator = template.validators[0];
  if (!validator) throw new Error("Exercise has no validator");

  if (validator.type === "exact-choice") {
    const normalized = String(answer);
    const correct = normalized === String(instance.expectedAnswer);
    return {
      correct,
      score: correct ? 1 : 0,
      normalizedAnswer: normalized,
      ...(correct ? {} : { errorCategory: "incorrect-choice" }),
      message: correct ? "Helyes válasz." : "Ez még nem a helyes válasz.",
    };
  }

  if (validator.type === "symbolic-equivalence") {
    return {
      correct: false,
      score: 0,
      message: "A kifejezést a szimbolikus szolgáltatással kell ellenőrizni.",
    };
  }

  const actual =
    typeof answer === "number"
      ? answer
      : Number(String(answer).replace(",", "."));
  const expected = Number(instance.expectedAnswer);
  if (!Number.isFinite(actual)) {
    return {
      correct: false,
      score: 0,
      errorCategory: "invalid-number",
      message: "Adj meg egy érvényes számot.",
    };
  }

  const difference = Math.abs(expected - actual);
  const tolerance = Math.max(
    validator.absoluteTolerance,
    validator.relativeTolerance * Math.abs(expected),
  );
  const correct = difference <= tolerance;
  const signError = !correct && Math.abs(expected + actual) <= tolerance;
  return {
    correct,
    score: correct ? 1 : 0,
    normalizedAnswer: actual,
    ...(correct
      ? {}
      : { errorCategory: signError ? "sign-error" : "numerical-error" }),
    message: correct
      ? "Helyes válasz."
      : `Nem egészen. Az eltérés ${difference.toPrecision(3)}.`,
  };
}

export { evaluateExpression } from "./expression";
