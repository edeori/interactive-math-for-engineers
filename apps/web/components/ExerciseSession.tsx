"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  PublicExerciseInstance,
  ValidationResult,
} from "@repo/shared-types";

interface Props {
  lessonId: string;
  templateIds: string[];
}

interface ExerciseStats {
  title: string;
  attempts: number;
  firstTryCorrect: boolean;
  hintsUsed: number;
}

export function ExerciseSession({ lessonId, templateIds }: Props) {
  const [index, setIndex] = useState(0);
  const [exercise, setExercise] = useState<PublicExerciseInstance | null>(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [usedHints, setUsedHints] = useState<string[]>([]);
  const [attempt, setAttempt] = useState(0);
  const [stats, setStats] = useState<Record<string, ExerciseStats>>({});
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const startedAt = useRef(Date.now());

  const templateId = templateIds[index];
  const seed = `${lessonId}-${index}-${attempt}`;

  const loadExercise = useCallback(async () => {
    if (!templateId) return;
    setLoading(true);
    setResult(null);
    setAnswer("");
    setUsedHints([]);
    const response = await fetch(
      `/api/exercises/${templateId}?seed=${encodeURIComponent(seed)}`,
    );
    if (!response.ok) throw new Error("A feladat nem tölthető be.");
    setExercise((await response.json()) as PublicExerciseInstance);
    startedAt.current = Date.now();
    setLoading(false);
  }, [seed, templateId]);

  useEffect(() => {
    void loadExercise();
  }, [loadExercise]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!templateId) return;
    const response = await fetch(`/api/exercises/${templateId}/submit`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        seed,
        answer,
        durationMs: Date.now() - startedAt.current,
        usedHintIds: usedHints,
        lessonId,
      }),
    });
    const validation = (await response.json()) as ValidationResult;
    setResult(validation);
    const previous = stats[templateId];
    setStats((values) => ({
      ...values,
      [templateId]: {
        title: exercise?.title ?? templateId,
        attempts: (previous?.attempts ?? 0) + 1,
        firstTryCorrect:
          previous?.firstTryCorrect ??
          (validation.correct && !previous && usedHints.length === 0),
        hintsUsed: Math.max(previous?.hintsUsed ?? 0, usedHints.length),
      },
    }));
    if (validation.correct) {
      setCompletedIds((values) =>
        values.includes(templateId) ? values : [...values, templateId],
      );
    }
  }

  function next() {
    if (index + 1 < templateIds.length) {
      setIndex((value) => value + 1);
    } else {
      setSessionComplete(true);
      void fetch("/api/progress", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lessonId, status: "completed" }),
      });
    }
    setAttempt((value) => value + 1);
  }

  function restart() {
    setIndex(0);
    setStats({});
    setCompletedIds([]);
    setSessionComplete(false);
    setAttempt((value) => value + 1);
  }

  if (sessionComplete) {
    const firstTryCorrect = Object.values(stats).filter(
      (item) => item.firstTryCorrect,
    ).length;
    const percentage = Math.round((firstTryCorrect / templateIds.length) * 100);
    const interpretation =
      percentage >= 80
        ? "Az alapok ezen a területen stabilnak látszanak."
        : percentage >= 50
          ? "A fő gondolat megvan, de néhány rész még tudatos gyakorlást igényel."
          : "Érdemes a magyarázatokat újra átnézni, majd friss feladatsorral ismételni.";
    return (
      <div className="exercise-card session-summary">
        <div className="exercise-head">
          <span>FELADATSOR KÉSZ</span>
          <span>{templateIds.length} ELLENŐRZÉSI PONT</span>
        </div>
        <p className="section-number">ÖNÁLLÓ ELSŐ PRÓBÁLKOZÁS</p>
        <div className="summary-score">
          <strong>{percentage}%</strong>
          <span>
            {firstTryCorrect}/{templateIds.length} feladat elsőre, tipp nélkül
          </span>
        </div>
        <p>{interpretation}</p>
        <div className="summary-breakdown">
          {templateIds.map((id) => {
            const item = stats[id];
            return (
              <div key={id}>
                <span className={item?.firstTryCorrect ? "stable" : "review"}>
                  {item?.firstTryCorrect ? "STABIL" : "ISMÉTELD"}
                </span>
                <strong>{item?.title ?? id}</strong>
                <small>
                  {item?.attempts ?? 0} próbálkozás · {item?.hintsUsed ?? 0}{" "}
                  tipp
                </small>
              </div>
            );
          })}
        </div>
        <button type="button" className="primary-button" onClick={restart}>
          Új feladatsor más seedekkel
        </button>
      </div>
    );
  }

  if (loading || !exercise)
    return <div className="exercise-card loading">Feladat generálása…</div>;

  return (
    <div className="exercise-card">
      <div className="exercise-head">
        <span>
          FELADAT {index + 1}/{templateIds.length}
        </span>
        <span>SEED · {exercise.seed}</span>
      </div>
      <div
        className="exercise-progress"
        aria-label={`${completedIds.length} kész a ${templateIds.length} feladatból`}
      >
        <span
          style={{
            width: `${(completedIds.length / templateIds.length) * 100}%`,
          }}
        />
      </div>
      <h3>{exercise.title}</h3>
      <p className="exercise-prompt">{exercise.renderedPrompt}</p>
      <form onSubmit={submit}>
        {exercise.answerType === "multiple-choice" ? (
          <div className="choice-grid">
            {exercise.options?.map((option) => (
              <label
                key={option.id}
                className={answer === option.id ? "selected" : ""}
              >
                <input
                  type="radio"
                  name="answer"
                  value={option.id}
                  checked={answer === option.id}
                  onChange={(event) => setAnswer(event.target.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        ) : (
          <label className="answer-field">
            <span>Válasz {exercise.unit ? `(${exercise.unit})` : ""}</span>
            <input
              inputMode="decimal"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Írd ide az eredményt"
            />
          </label>
        )}

        <div className="hint-list">
          {exercise.hints.map((hint) =>
            usedHints.includes(hint.id) ? (
              <p key={hint.id}>Tipp: {hint.text}</p>
            ) : null,
          )}
        </div>

        {result && (
          <div
            className={`feedback ${result.correct ? "correct" : "incorrect"}`}
            role="status"
          >
            {result.message}
          </div>
        )}

        <div className="exercise-actions">
          <button
            type="button"
            className="text-button"
            onClick={() => {
              const nextHint = exercise.hints.find(
                (hint) => !usedHints.includes(hint.id),
              );
              if (nextHint) setUsedHints((values) => [...values, nextHint.id]);
            }}
          >
            Tipp kérése
          </button>
          {result?.correct ? (
            <button type="button" className="primary-button" onClick={next}>
              {index + 1 === templateIds.length
                ? "Eredmény megtekintése →"
                : "Következő feladat →"}
            </button>
          ) : (
            <button type="submit" className="primary-button" disabled={!answer}>
              Ellenőrzés
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
