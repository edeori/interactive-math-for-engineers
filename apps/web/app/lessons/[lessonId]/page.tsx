import Link from "next/link";
import { notFound } from "next/navigation";
import { loadCurriculum } from "@repo/curriculum";
import { ExponentialDecayLab } from "@/components/ExponentialDecayLab";
import { ExerciseSession } from "@/components/ExerciseSession";

export const dynamic = "force-dynamic";

const LABS: Record<string, React.ComponentType> = {
  "exponential-decay-lab": ExponentialDecayLab,
};

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const curriculum = loadCurriculum();
  const lesson = curriculum.lessons.find(
    (candidate) => candidate.id === lessonId,
  );
  if (!lesson) notFound();
  const module = curriculum.modules.find(
    (candidate) => candidate.id === lesson.moduleId,
  );
  const lessonIndex = curriculum.lessons.findIndex(
    (candidate) => candidate.id === lesson.id,
  );
  const previousLesson = curriculum.lessons[lessonIndex - 1];
  const nextLesson = curriculum.lessons[lessonIndex + 1];

  return (
    <div className="lesson-layout">
      <aside className="lesson-rail">
        <p className="eyebrow">
          {module?.subtitle ?? "Tananyag"} · {module?.title}
        </p>
        <h1>{lesson.title}</h1>
        <p>{lesson.summary}</p>
        <div className="lesson-meta">
          <span>{lesson.estimatedMinutes} perc</span>
          <span>{lesson.sections.length} fejezet</span>
        </div>
        <nav aria-label="Lecke fejezetei">
          {lesson.sections.map((section, index) => (
            <a href={`#section-${index + 1}`} key={`${section.type}-${index}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {section.title}
            </a>
          ))}
          <a href="#gyakorlas">
            <span>{String(lesson.sections.length + 1).padStart(2, "0")}</span>
            Gyakorlás
          </a>
        </nav>
      </aside>

      <article className="lesson-content">
        {lesson.sections.map((section, index) => {
          const number = String(index + 1).padStart(2, "0");
          if (section.type === "interactive") {
            const Lab = LABS[section.labId];
            return (
              <section
                id={`section-${index + 1}`}
                className="lesson-section wide-section"
                key={number}
              >
                <p className="section-number">{number} · INTERAKTÍV LABOR</p>
                <h2>{section.title}</h2>
                <p>{section.body}</p>
                {Lab ? <Lab /> : <p>Az interaktív komponens nem érhető el.</p>}
              </section>
            );
          }

          return (
            <section
              id={`section-${index + 1}`}
              className="lesson-section"
              key={number}
            >
              <p className="section-number">
                {number} · {section.type.replaceAll("-", " ")}
              </p>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
              {section.type === "formula" && (
                <div
                  className="formula"
                  role="math"
                  aria-label={section.formula}
                >
                  {section.formula}
                </div>
              )}
              {section.type === "worked-example" && (
                <ol className="worked-steps">
                  {section.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              )}
              {section.type === "reflection" && (
                <ul className="reflection-list">
                  {section.questions.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
              )}
              {section.type === "objectives" && (
                <ul className="objective-list">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {section.type === "common-mistakes" && (
                <div className="mistake-list">
                  {section.items.map((item) => (
                    <div key={item.mistake}>
                      <strong>{item.mistake}</strong>
                      <span>{item.correction}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}

        <section id="gyakorlas" className="lesson-section wide-section">
          <p className="section-number">
            {String(lesson.sections.length + 1).padStart(2, "0")} · GYAKORLÁS
          </p>
          <h2>Alkalmazd, amit megfigyeltél</h2>
          <p>
            Minden új próbálkozás reprodukálható, de más paraméterekkel készül.
          </p>
          <ExerciseSession
            lessonId={lesson.id}
            templateIds={lesson.exerciseTemplateIds}
          />
        </section>

        <nav
          className="lesson-pagination"
          aria-label="Leckék közötti navigáció"
        >
          {previousLesson ? (
            <Link href={`/lessons/${previousLesson.id}`}>
              <small>← Előző lecke</small>
              <strong>{previousLesson.title}</strong>
            </Link>
          ) : (
            <span />
          )}
          {nextLesson ? (
            <Link href={`/lessons/${nextLesson.id}`}>
              <small>Következő lecke →</small>
              <strong>{nextLesson.title}</strong>
            </Link>
          ) : (
            <Link href="/#tanterv">
              <small>Kurzus vége</small>
              <strong>Vissza a tantervhez</strong>
            </Link>
          )}
        </nav>
      </article>
    </div>
  );
}
