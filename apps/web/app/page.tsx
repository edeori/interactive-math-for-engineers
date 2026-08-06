import Link from "next/link";
import { loadCurriculum } from "@repo/curriculum";

export const dynamic = "force-dynamic";

export default function Dashboard() {
  const curriculum = loadCurriculum();
  const lesson = curriculum.lessons[0];
  if (!lesson) return <div className="page-shell">Nincs elérhető lecke.</div>;
  const currentModule = curriculum.modules.find(
    (module) => module.id === lesson.moduleId,
  );

  return (
    <div className="page-shell dashboard">
      <section className="hero">
        <div>
          <p className="eyebrow">A változás matematikája · 01</p>
          <h1>Építsd újra a matematikai intuíciódat.</h1>
          <p className="hero-copy">
            Fedezd fel ugyanazokat a struktúrákat audióban, elektronikában és
            fizikai rendszerekben — interaktívan, determinisztikusan ellenőrzött
            feladatokkal.
          </p>
          <Link className="primary-button" href={`/lessons/${lesson.id}`}>
            Lecke folytatása <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div
          className="signal-card"
          aria-label="Exponenciális lecsengést ábrázoló dekoráció"
        >
          <svg viewBox="0 0 440 260" role="img" aria-label="Lecsengő jelalak">
            <defs>
              <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#f2a65a" stopOpacity=".45" />
                <stop offset="1" stopColor="#f2a65a" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              className="grid-line"
              d="M20 50H420M20 100H420M20 150H420M20 200H420"
            />
            <path
              className="grid-line"
              d="M100 24V224M180 24V224M260 24V224M340 24V224"
            />
            <path
              className="signal-area"
              d="M20 38 C70 55,85 91,130 116 S220 167,420 207 L420 224 L20 224Z"
            />
            <path
              className="signal-line"
              d="M20 38 C70 55,85 91,130 116 S220 167,420 207"
            />
            <circle cx="130" cy="116" r="6" />
            <text x="142" y="108">
              τ · 36,8%
            </text>
          </svg>
          <div className="signal-readout">
            <span>RELEASE ENVELOPE</span>
            <strong>
              A(t) = A₀e<sup>−t/τ</sup>
            </strong>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="panel current-module">
          <p className="panel-label">Javasolt kezdő lecke</p>
          <div className="module-number">
            {String(currentModule?.order ?? 0).padStart(2, "0")}
          </div>
          <div>
            <h2>{lesson.title}</h2>
            <p>{lesson.summary}</p>
            <div className="meta-row">
              <span>{lesson.estimatedMinutes} perc</span>
              <span>{lesson.exerciseTemplateIds.length} feladattípus</span>
              <span>{lesson.labIds.length} interaktív labor</span>
            </div>
          </div>
        </article>

        <article className="panel stats-panel">
          <p className="panel-label">Tanulási térkép</p>
          <div className="stat">
            <strong>{curriculum.skills.length}</strong>
            <span>aktív készség</span>
          </div>
          <div className="stat">
            <strong>{curriculum.exercises.length * 50}+</strong>
            <span>validált variáns</span>
          </div>
          <div className="stat">
            <strong>3</strong>
            <span>kontextus</span>
          </div>
        </article>

        <article className="panel principle-panel">
          <p className="panel-label">Tanulási ritmus</p>
          <ol>
            <li>
              <span>01</span> Figyeld meg a jelenséget
            </li>
            <li>
              <span>02</span> Építs intuitív modellt
            </li>
            <li>
              <span>03</span> Fogalmazd meg matematikailag
            </li>
            <li>
              <span>04</span> Alkalmazd új kontextusban
            </li>
          </ol>
        </article>
      </section>

      <section id="tanterv" className="curriculum-map">
        <div className="curriculum-heading">
          <div>
            <p className="eyebrow">Teljes tanulási útvonal</p>
            <h2>A szintrehozástól a mérnöki modellezésig</h2>
          </div>
          <p>
            {curriculum.modules.length} fejezet · {curriculum.lessons.length}{" "}
            lecke · {curriculum.exercises.length} feladatsablon
          </p>
        </div>
        <div className="module-list">
          {curriculum.modules.map((module) => {
            const lessons = curriculum.lessons.filter(
              (candidate) => candidate.moduleId === module.id,
            );
            return (
              <article className="module-card" key={module.id}>
                <div className="module-card-head">
                  <span>{String(module.order).padStart(2, "0")}</span>
                  <div>
                    <p>{module.subtitle}</p>
                    <h3>{module.title}</h3>
                    <p>{module.description}</p>
                  </div>
                  <strong>{lessons.length} lecke</strong>
                </div>
                <ol>
                  {lessons.map((moduleLesson) => (
                    <li key={moduleLesson.id}>
                      <Link href={`/lessons/${moduleLesson.id}`}>
                        <span>
                          {String(moduleLesson.order).padStart(2, "0")}
                        </span>
                        <span>
                          <strong>{moduleLesson.title}</strong>
                          <small>{moduleLesson.estimatedMinutes} perc</small>
                        </span>
                        <span aria-hidden="true">→</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
