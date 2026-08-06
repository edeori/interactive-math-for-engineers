import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  courseModuleSchema,
  exerciseTemplateSchema,
  lessonBlueprintSchema,
  lessonEnrichmentSchema,
  lessonSchema,
  skillSchema,
  type CourseModule,
  type ExerciseTemplate,
  type Lesson,
  type LessonBlueprint,
  type LessonEnrichment,
  type Skill,
} from "@repo/shared-types";
import { generateExercise, validateAnswer } from "@repo/exercise-engine";
import type { z } from "zod";

export interface Curriculum {
  modules: CourseModule[];
  skills: Skill[];
  lessons: Lesson[];
  exercises: ExerciseTemplate[];
}

export function resolveContentRoot(explicitRoot?: string): string {
  const candidates = [
    explicitRoot,
    process.env.CONTENT_ROOT,
    resolve(process.cwd(), "content"),
    resolve(process.cwd(), "../../content"),
  ].filter((candidate): candidate is string => Boolean(candidate));

  const root = candidates.find((candidate) =>
    existsSync(join(candidate, "lessons")),
  );
  if (!root)
    throw new Error(
      `Content directory not found. Tried: ${candidates.join(", ")}`,
    );
  return root;
}

function loadDirectory<Schema extends z.ZodTypeAny>(
  directory: string,
  schema: Schema,
): Array<z.output<Schema>> {
  const files = readdirSync(directory)
    .filter((file) => file.endsWith(".json"))
    .sort();
  return files.flatMap((file) => {
    const path = join(directory, file);
    let parsed: unknown;
    try {
      parsed = JSON.parse(readFileSync(path, "utf8"));
    } catch (error) {
      throw new Error(`Cannot parse ${path}: ${String(error)}`);
    }
    const entries = Array.isArray(parsed) ? parsed : [parsed];
    return entries.map((entry, index) => {
      const result = schema.safeParse(entry);
      if (!result.success) {
        throw new Error(
          `Invalid content in ${path} at item ${index}: ${result.error.message}`,
        );
      }
      return result.data;
    });
  });
}

function expandBlueprints(
  blueprints: LessonBlueprint[],
  authoredLessons: Lesson[],
): { skills: Skill[]; lessons: Lesson[]; exercises: ExerciseTemplate[] } {
  const blueprintByLesson = new Map(
    blueprints.map((blueprint) => [blueprint.id, blueprint]),
  );
  const authoredByLesson = new Map(
    authoredLessons.map((lesson) => [lesson.id, lesson]),
  );

  const skills = blueprints.map((blueprint): Skill => {
    const prerequisites = blueprint.prerequisiteLessonIds.flatMap(
      (lessonId) => {
        const dependencyBlueprint = blueprintByLesson.get(lessonId);
        if (dependencyBlueprint) return [dependencyBlueprint.skill.id];
        return authoredByLesson.get(lessonId)?.skillIds ?? [];
      },
    );
    return {
      id: blueprint.skill.id,
      title: blueprint.skill.title,
      description: blueprint.skill.description,
      category: blueprint.skill.category,
      masteryThreshold: blueprint.skill.masteryThreshold,
      prerequisites,
    };
  });

  const lessons = blueprints.map((blueprint): Lesson => {
    const sections: Lesson["sections"] = [
      {
        type: "real-world-problem",
        title: "A probléma, amit meg akarunk oldani",
        body: blueprint.realWorldProblem,
      },
      {
        type: "intuition",
        title: "Intuitív kép",
        body: blueprint.intuition.join(" "),
      },
      ...(blueprint.formalModel
        ? [
            {
              type: "formula" as const,
              title: "Formális modell",
              body: blueprint.skill.description,
              formula: blueprint.formalModel,
            },
          ]
        : []),
      {
        type: "worked-example",
        title: "Kapcsolatok és alkalmazások",
        body: `A ${blueprint.title.toLocaleLowerCase("hu-HU")} több mérnöki területen ugyanazt a matematikai szerkezetet mutatja.`,
        steps: blueprint.applications,
      },
      {
        type: "reflection",
        title: "Ellenőrizd a megértésed",
        body: "Ne csak a képletet jegyezd meg: fogalmazd meg saját szavaiddal a modell jelentését.",
        questions: [
          `Mi a ${blueprint.title.toLocaleLowerCase("hu-HU")} legfontosabb intuitív állítása?`,
          "Melyik feltétel megsértése tenné érvénytelenné a modellt?",
          "Hogyan ismernéd fel ugyanezt a szerkezetet egy új mérnöki problémában?",
        ],
      },
    ];
    return {
      id: blueprint.id,
      moduleId: blueprint.moduleId,
      order: blueprint.order,
      title: blueprint.title,
      summary: blueprint.summary,
      skillIds: [blueprint.skill.id],
      prerequisiteLessonIds: blueprint.prerequisiteLessonIds,
      estimatedMinutes: blueprint.estimatedMinutes,
      sections,
      exerciseTemplateIds: [`${blueprint.id}-checkpoint`],
      labIds: [],
    };
  });

  const exercises = blueprints.map((blueprint): ExerciseTemplate => ({
    id: `${blueprint.id}-checkpoint`,
    version: 1,
    title: `${blueprint.title} – koncepcióellenőrzés`,
    skillIds: [blueprint.skill.id],
    difficulty: 2,
    context: "abstract",
    parameters: {},
    promptTemplate: blueprint.checkpoint.prompt,
    answerType: "multiple-choice",
    options: blueprint.checkpoint.options,
    solution: { type: "value", value: blueprint.checkpoint.answer },
    hints: [{ id: "concept-hint", text: blueprint.checkpoint.hint }],
    validators: [{ type: "exact-choice" }],
    metadata: { generatedFromBlueprint: blueprint.id },
  }));
  return { skills, lessons, exercises };
}

function applyEnrichments(
  lessons: Lesson[],
  enrichments: LessonEnrichment[],
): { lessons: Lesson[]; exercises: ExerciseTemplate[] } {
  const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const exercises: ExerciseTemplate[] = [];

  for (const enrichment of enrichments) {
    const lesson = lessonById.get(enrichment.lessonId);
    if (!lesson) {
      throw new Error(
        `Enrichment references missing lesson ${enrichment.lessonId}`,
      );
    }
    const checkpointIds = enrichment.checkpoints.map(
      (checkpoint) => `${lesson.id}-${checkpoint.id}`,
    );
    const sections = enrichment.replaceSections
      ? enrichment.sections
      : lesson.sections.flatMap((section) =>
          section.type === "reflection"
            ? [...enrichment.sections, section]
            : [section],
        );
    lessonById.set(lesson.id, {
      ...lesson,
      sections,
      exerciseTemplateIds: [...lesson.exerciseTemplateIds, ...checkpointIds],
    });

    for (const checkpoint of enrichment.checkpoints) {
      exercises.push({
        id: `${lesson.id}-${checkpoint.id}`,
        version: 1,
        title: checkpoint.title,
        skillIds: lesson.skillIds,
        difficulty: checkpoint.difficulty,
        context: checkpoint.context,
        parameters: {},
        promptTemplate: checkpoint.prompt,
        answerType: "multiple-choice",
        options: checkpoint.options,
        solution: { type: "value", value: checkpoint.answer },
        hints: [{ id: "guided-hint", text: checkpoint.hint }],
        validators: [{ type: "exact-choice" }],
        metadata: { enrichmentForLesson: lesson.id },
      });
    }
  }

  return { lessons: [...lessonById.values()], exercises };
}

export function loadCurriculum(contentRoot?: string): Curriculum {
  const root = resolveContentRoot(contentRoot);
  const authoredLessons = loadDirectory(join(root, "lessons"), lessonSchema);
  const blueprints = loadDirectory(
    join(root, "lesson-blueprints"),
    lessonBlueprintSchema,
  );
  const expanded = expandBlueprints(blueprints, authoredLessons);
  const enriched = applyEnrichments(
    [...authoredLessons, ...expanded.lessons],
    loadDirectory(join(root, "lesson-enrichments"), lessonEnrichmentSchema),
  );
  return {
    modules: loadDirectory(join(root, "modules"), courseModuleSchema).sort(
      (left, right) => left.order - right.order,
    ),
    skills: [
      ...loadDirectory(join(root, "skills"), skillSchema),
      ...expanded.skills,
    ],
    lessons: enriched.lessons.sort(
      (left, right) =>
        left.moduleId.localeCompare(right.moduleId) || left.order - right.order,
    ),
    exercises: [
      ...loadDirectory(join(root, "exercises"), exerciseTemplateSchema),
      ...expanded.exercises,
      ...enriched.exercises,
    ],
  };
}

function duplicateIds(items: Array<{ id: string }>): string[] {
  const seen = new Set<string>();
  return items.flatMap(({ id }) => {
    if (seen.has(id)) return [id];
    seen.add(id);
    return [];
  });
}

function findCycles(
  items: Array<{ id: string; prerequisites: string[] }>,
): string[] {
  const graph = new Map(items.map((item) => [item.id, item.prerequisites]));
  const visited = new Set<string>();
  const active = new Set<string>();
  const cycles: string[] = [];

  function visit(id: string, path: string[]): void {
    if (active.has(id)) {
      cycles.push([...path, id].join(" -> "));
      return;
    }
    if (visited.has(id)) return;
    active.add(id);
    for (const dependency of graph.get(id) ?? [])
      visit(dependency, [...path, id]);
    active.delete(id);
    visited.add(id);
  }

  for (const id of graph.keys()) visit(id, []);
  return cycles;
}

export function validateCurriculum(curriculum: Curriculum): string[] {
  const errors: string[] = [];
  for (const [name, items] of [
    ["module", curriculum.modules],
    ["skill", curriculum.skills],
    ["lesson", curriculum.lessons],
    ["exercise", curriculum.exercises],
  ] as const) {
    for (const id of duplicateIds(items))
      errors.push(`Duplicate ${name} id: ${id}`);
  }

  const skillIds = new Set(curriculum.skills.map(({ id }) => id));
  const moduleIds = new Set(curriculum.modules.map(({ id }) => id));
  const lessonIds = new Set(curriculum.lessons.map(({ id }) => id));
  const exerciseIds = new Set(curriculum.exercises.map(({ id }) => id));

  for (const skill of curriculum.skills) {
    for (const prerequisite of skill.prerequisites) {
      if (!skillIds.has(prerequisite)) {
        errors.push(
          `Skill ${skill.id} references missing prerequisite ${prerequisite}`,
        );
      }
    }
  }

  for (const lesson of curriculum.lessons) {
    if (!moduleIds.has(lesson.moduleId)) {
      errors.push(
        `Lesson ${lesson.id} references missing module ${lesson.moduleId}`,
      );
    }
    for (const skillId of lesson.skillIds) {
      if (!skillIds.has(skillId))
        errors.push(`Lesson ${lesson.id} references missing skill ${skillId}`);
    }
    for (const lessonId of lesson.prerequisiteLessonIds) {
      if (!lessonIds.has(lessonId)) {
        errors.push(
          `Lesson ${lesson.id} references missing lesson ${lessonId}`,
        );
      }
    }
    for (const exerciseId of lesson.exerciseTemplateIds) {
      if (!exerciseIds.has(exerciseId)) {
        errors.push(
          `Lesson ${lesson.id} references missing exercise ${exerciseId}`,
        );
      }
    }
  }

  for (const exercise of curriculum.exercises) {
    for (const skillId of exercise.skillIds) {
      if (!skillIds.has(skillId)) {
        errors.push(
          `Exercise ${exercise.id} references missing skill ${skillId}`,
        );
      }
    }
    const choiceAnswer =
      exercise.solution.type === "value"
        ? String(exercise.solution.value)
        : undefined;
    if (
      exercise.answerType === "multiple-choice" &&
      choiceAnswer !== undefined &&
      !exercise.options?.some((option) => option.id === choiceAnswer)
    ) {
      errors.push(
        `Exercise ${exercise.id} has an answer that is not an option`,
      );
    }
    for (let seedIndex = 0; seedIndex < 50; seedIndex += 1) {
      try {
        const instance = generateExercise(exercise, `validation-${seedIndex}`);
        const validation = validateAnswer(
          exercise,
          instance,
          instance.expectedAnswer,
        );
        if (
          exercise.validators[0]?.type !== "symbolic-equivalence" &&
          !validation.correct
        ) {
          errors.push(
            `Exercise ${exercise.id} rejects its own answer for seed ${seedIndex}`,
          );
          break;
        }
      } catch (error) {
        errors.push(
          `Exercise ${exercise.id} fails for seed ${seedIndex}: ${String(error)}`,
        );
        break;
      }
    }
  }

  errors.push(
    ...findCycles(curriculum.skills).map((cycle) => `Skill cycle: ${cycle}`),
  );
  errors.push(
    ...findCycles(
      curriculum.lessons.map((lesson) => ({
        id: lesson.id,
        prerequisites: lesson.prerequisiteLessonIds,
      })),
    ).map((cycle) => `Lesson cycle: ${cycle}`),
  );
  return errors;
}

export function getLesson(
  id: string,
  contentRoot?: string,
): Lesson | undefined {
  return loadCurriculum(contentRoot).lessons.find((lesson) => lesson.id === id);
}

export function getExercise(
  id: string,
  contentRoot?: string,
): ExerciseTemplate | undefined {
  return loadCurriculum(contentRoot).exercises.find(
    (exercise) => exercise.id === id,
  );
}
