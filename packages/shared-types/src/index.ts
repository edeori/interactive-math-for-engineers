import { z } from "zod";

export const skillSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  prerequisites: z.array(z.string()),
  category: z.enum([
    "foundation",
    "calculus",
    "linear-algebra",
    "differential-equations",
    "statistics",
    "dsp",
    "numerical-methods",
  ]),
  masteryThreshold: z.number().min(0).max(1),
});

export type Skill = z.infer<typeof skillSchema>;

export const courseModuleSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().nonnegative(),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  description: z.string().min(1),
});

export type CourseModule = z.infer<typeof courseModuleSchema>;

export const lessonSectionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("real-world-problem"),
    title: z.string(),
    body: z.string(),
  }),
  z.object({
    type: z.literal("intuition"),
    title: z.string(),
    body: z.string(),
  }),
  z.object({
    type: z.literal("formula"),
    title: z.string(),
    body: z.string(),
    formula: z.string(),
  }),
  z.object({
    type: z.literal("interactive"),
    title: z.string(),
    body: z.string(),
    labId: z.string(),
  }),
  z.object({
    type: z.literal("worked-example"),
    title: z.string(),
    body: z.string(),
    steps: z.array(z.string()).min(1),
  }),
  z.object({
    type: z.literal("reflection"),
    title: z.string(),
    body: z.string(),
    questions: z.array(z.string()).min(1),
  }),
  z.object({
    type: z.literal("objectives"),
    title: z.string(),
    body: z.string(),
    items: z.array(z.string()).min(1),
  }),
  z.object({
    type: z.literal("common-mistakes"),
    title: z.string(),
    body: z.string(),
    items: z
      .array(
        z.object({
          mistake: z.string().min(1),
          correction: z.string().min(1),
        }),
      )
      .min(1),
  }),
]);

export const lessonSchema = z.object({
  id: z.string().min(1),
  moduleId: z.string().min(1),
  order: z.number().int().nonnegative(),
  title: z.string().min(1),
  summary: z.string().min(1),
  skillIds: z.array(z.string()).min(1),
  prerequisiteLessonIds: z.array(z.string()),
  estimatedMinutes: z.number().int().positive(),
  sections: z.array(lessonSectionSchema).min(1),
  exerciseTemplateIds: z.array(z.string()).min(1),
  labIds: z.array(z.string()),
});

export type Lesson = z.infer<typeof lessonSchema>;
export type LessonSection = z.infer<typeof lessonSectionSchema>;

export const lessonBlueprintSchema = z.object({
  id: z.string().min(1),
  moduleId: z.string().min(1),
  order: z.number().int().nonnegative(),
  title: z.string().min(1),
  summary: z.string().min(1),
  estimatedMinutes: z.number().int().positive(),
  prerequisiteLessonIds: z.array(z.string()),
  skill: z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    category: skillSchema.shape.category,
    masteryThreshold: z.number().min(0).max(1).default(0.75),
  }),
  realWorldProblem: z.string().min(1),
  intuition: z.array(z.string().min(1)).min(2),
  formalModel: z.string().min(1).optional(),
  applications: z.array(z.string().min(1)).min(2),
  checkpoint: z.object({
    prompt: z.string().min(1),
    options: z.array(z.object({ id: z.string(), label: z.string() })).min(2),
    answer: z.string().min(1),
    hint: z.string().min(1),
  }),
});

export type LessonBlueprint = z.infer<typeof lessonBlueprintSchema>;

export const lessonEnrichmentSchema = z.object({
  lessonId: z.string().min(1),
  replaceSections: z.boolean().default(false),
  sections: z.array(lessonSectionSchema).min(1),
  checkpoints: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        prompt: z.string().min(1),
        difficulty: z.union([
          z.literal(1),
          z.literal(2),
          z.literal(3),
          z.literal(4),
          z.literal(5),
        ]),
        context: z.enum(["abstract", "audio", "mechanics", "electronics"]),
        options: z
          .array(z.object({ id: z.string(), label: z.string() }))
          .min(2),
        answer: z.string().min(1),
        hint: z.string().min(1),
      }),
    )
    .min(1),
});

export type LessonEnrichment = z.infer<typeof lessonEnrichmentSchema>;

const integerParameterSchema = z.object({
  type: z.literal("integer"),
  min: z.number().int(),
  max: z.number().int(),
  exclude: z.array(z.number().int()).optional(),
});

const decimalParameterSchema = z.object({
  type: z.literal("decimal"),
  min: z.number(),
  max: z.number(),
  step: z.number().positive(),
  exclude: z.array(z.number()).optional(),
});

const choiceParameterSchema = z.object({
  type: z.literal("choice"),
  choices: z.array(z.union([z.string(), z.number()])).min(1),
});

const derivedParameterSchema = z.object({
  type: z.literal("derived"),
  expression: z.string().min(1),
  decimals: z.number().int().min(0).max(12).optional(),
});

export const parameterDefinitionSchema = z.discriminatedUnion("type", [
  integerParameterSchema,
  decimalParameterSchema,
  choiceParameterSchema,
  derivedParameterSchema,
]);

export type ParameterDefinition = z.infer<typeof parameterDefinitionSchema>;

export const hintSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
});

export const validatorSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("numeric-tolerance"),
    absoluteTolerance: z.number().nonnegative(),
    relativeTolerance: z.number().nonnegative().default(0),
  }),
  z.object({
    type: z.literal("exact-choice"),
  }),
  z.object({
    type: z.literal("symbolic-equivalence"),
    variables: z.array(z.string()).default([]),
    domain: z.enum(["real", "complex"]).default("real"),
  }),
]);

export const solutionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("formula"), expression: z.string().min(1) }),
  z.object({
    type: z.literal("value"),
    value: z.union([z.string(), z.number()]),
  }),
]);

export const exerciseTemplateSchema = z.object({
  id: z.string().min(1),
  version: z.number().int().positive(),
  title: z.string().min(1),
  skillIds: z.array(z.string()).min(1),
  difficulty: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  context: z.enum(["abstract", "audio", "mechanics", "electronics"]),
  parameters: z.record(parameterDefinitionSchema),
  promptTemplate: z.string().min(1),
  answerType: z.enum([
    "numeric",
    "expression",
    "multiple-choice",
    "ordered-steps",
    "graph-point",
    "interval",
    "free-text",
  ]),
  options: z.array(z.object({ id: z.string(), label: z.string() })).optional(),
  solution: solutionSchema,
  hints: z.array(hintSchema),
  validators: z.array(validatorSchema).min(1),
  unit: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type ExerciseTemplate = z.infer<typeof exerciseTemplateSchema>;

export interface ExerciseInstance {
  id: string;
  templateId: string;
  templateVersion: number;
  seed: string;
  generatedParameters: Record<string, number | string>;
  renderedPrompt: string;
  expectedAnswer: number | string;
  createdAt: string;
}

export interface PublicExerciseInstance extends Omit<
  ExerciseInstance,
  "expectedAnswer"
> {
  title: string;
  answerType: ExerciseTemplate["answerType"];
  options?: Array<{ id: string; label: string }>;
  hints: Array<{ id: string; text: string }>;
  unit?: string;
}

export interface ValidationResult {
  correct: boolean;
  score: number;
  normalizedAnswer?: number | string;
  errorCategory?: string;
  message: string;
}
