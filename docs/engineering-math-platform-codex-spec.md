# Interactive Engineering Mathematics Learning Platform

## Codex Implementation Specification

## 1. Project Goal

Build a web-based, interactive mathematics learning platform for an experienced software engineer who studied university-level mathematics more than ten years ago and wants to rebuild and deepen that knowledge.

The platform must:

- start from fundamentals without assuming which prerequisites are still remembered;
- progress up to advanced university-level engineering mathematics;
- use real-world examples wherever possible;
- prioritize audio engineering, DSP, acoustics, signal processing, and plugin-development examples;
- also use mechanics, electronics, and physical-system examples;
- teach intuition before formal notation;
- provide interactive visual explanations;
- generate and validate exercises;
- adapt to the learner's actual weak points;
- avoid relying on an LLM as the source of mathematical truth;
- eventually enable the learner to discuss applied mathematical problems meaningfully with mathematicians, DSP engineers, and researchers.

The first implementation should be an MVP, not the complete curriculum.

---

# 2. Core Product Principles

## 2.1 Teaching sequence

Every new concept should preferably follow this sequence:

1. Real-world problem
2. Interactive observation
3. Intuitive explanation
4. Formal mathematical model
5. Visual derivation
6. Guided exercise
7. Independent exercise
8. Implementation or simulation task
9. Interpretation question
10. Scheduled review

## 2.2 Multiple representations

Important concepts should be presented in at least three representations:

- abstract mathematical form;
- audio engineering or DSP context;
- mechanical, electrical, or other physical context.

Example:

A first-order differential equation should be connected to:

- compressor release;
- capacitor discharge;
- thermal cooling;
- mechanical damping.

## 2.3 Mathematical correctness

The LLM must not be treated as the source of truth.

Mathematical validation must use deterministic systems such as:

- symbolic computation;
- numerical verification;
- unit tests;
- domain constraints;
- authored solution models;
- deterministic answer validators.

AI may be used for:

- alternative explanations;
- tutoring dialogue;
- hint wording;
- contextual adaptation;
- error interpretation;
- generating draft exercise templates;
- suggesting examples.

AI-generated content must not enter the stable exercise bank unless it passes automated validation and, where applicable, human review.

---

# 3. Target Curriculum

The long-term curriculum should cover the following.

## 3.1 Foundations and diagnostics

- arithmetic refresh;
- fractions;
- exponents;
- roots;
- algebraic transformations;
- equations and inequalities;
- functions;
- logarithms;
- exponentials;
- trigonometry;
- vectors;
- coordinate geometry;
- summation notation;
- units and dimensional analysis.

## 3.2 Differential calculus

- limits;
- continuity;
- derivatives;
- product rule;
- quotient rule;
- chain rule;
- implicit differentiation;
- partial derivatives;
- gradient;
- extrema;
- optimization;
- numerical differentiation;
- local linearization.

Audio examples:

- waveform slope;
- transient detection;
- compressor transfer curves;
- envelope attack and release;
- resonance peak detection;
- nonlinear transfer functions;
- soft-clipping smoothness.

Mechanical examples:

- position;
- velocity;
- acceleration;
- falling objects;
- braking;
- spring systems.

## 3.3 Integral calculus

- antiderivatives;
- definite integrals;
- area;
- accumulation;
- numerical integration;
- improper integrals;
- multiple integrals;
- average values.

Audio examples:

- RMS;
- signal energy;
- average power;
- integrated loudness approximation;
- spectral energy;
- convolution;
- impulse-response energy.

## 3.4 Complex numbers and linear algebra

- complex plane;
- Euler's formula;
- polar representation;
- vectors;
- matrices;
- matrix transformations;
- linear systems;
- determinants;
- basis changes;
- eigenvalues;
- eigenvectors;
- orthogonality;
- projections;
- least squares.

Audio examples:

- phase representation;
- complex frequency response;
- Mid/Side transformation;
- channel mixing;
- microphone arrays;
- state-space filters;
- PCA on audio features;
- feedback delay networks.

## 3.5 Differential equations

- first-order ODEs;
- second-order ODEs;
- linear systems;
- initial value problems;
- stability;
- forced systems;
- resonance;
- state-space representation;
- nonlinear ODE basics;
- numerical ODE solvers.

Audio and physical examples:

- RC filters;
- RLC systems;
- envelope followers;
- compressor release;
- spring-mass-damper systems;
- resonators;
- analog circuit modelling;
- nonlinear diode models;
- digital discretization.

## 3.6 Fourier analysis and DSP mathematics

- sinusoidal decomposition;
- orthogonality;
- Fourier series;
- Fourier transform;
- DFT;
- FFT;
- window functions;
- spectral leakage;
- convolution;
- correlation;
- impulse response;
- transfer functions;
- sampling;
- aliasing;
- z-transform;
- poles and zeros;
- FIR filters;
- IIR filters;
- phase response;
- filter stability.

## 3.7 Probability and statistics

- descriptive statistics;
- distributions;
- expectation;
- variance;
- covariance;
- normal distribution;
- conditional probability;
- Bayes theorem;
- sampling;
- confidence intervals;
- hypothesis testing;
- correlation;
- regression;
- outliers;
- multivariate statistics;
- PCA;
- clustering basics;
- precision;
- recall;
- ROC;
- bootstrap;
- time-series basics.

Audio examples:

- detector false positives;
- mouth-click detection;
- breath detection;
- raw/wet feature distributions;
- threshold optimization;
- A/B testing;
- measurement uncertainty;
- annotator agreement;
- algorithm comparison.

## 3.8 Numerical methods and optimization

- floating-point error;
- root finding;
- Newton's method;
- numerical integration;
- numerical differentiation;
- interpolation;
- linear-system solvers;
- least squares;
- gradient descent;
- constrained optimization;
- ODE solvers;
- convergence;
- numerical stability.

Audio examples:

- filter calibration;
- nonlinear model fitting;
- envelope constant estimation;
- EQ curve fitting;
- detector threshold optimization;
- parameter estimation from raw/wet pairs.

---

# 4. MVP Scope

The MVP must implement one complete vertical slice.

## MVP module title

**The Mathematics of Change**

## MVP curriculum

1. Functions and graphs
2. Exponents and logarithms
3. Decibels
4. Exponential decay
5. Limits as an intuition
6. Derivative as rate of change
7. Basic derivative rules
8. Chain rule
9. Local extrema
10. Numerical differentiation
11. Audio envelopes
12. Transient detection
13. Basic parameter optimization

## MVP content targets

- 10-15 interactive lessons;
- 30-50 authored exercise templates;
- hundreds of generated exercise variants;
- diagnostic quiz;
- progress tracking;
- skill graph;
- interactive audio examples;
- symbolic answer checking;
- guided hints;
- review scheduling;
- basic learner model.

## Out of scope for the first MVP

- full multi-year curriculum;
- collaborative classroom features;
- mobile applications;
- native desktop client;
- full LLM tutoring agent;
- payment system;
- public course marketplace;
- social feed;
- teacher dashboard;
- large-scale imported external problem bank.

---

# 5. Recommended Technical Stack

## 5.1 Monorepo

Use a monorepo.

Recommended:

- pnpm workspaces;
- Turborepo;
- TypeScript strict mode;
- ESLint;
- Prettier;
- Vitest;
- Playwright.

## 5.2 Frontend

- Next.js with App Router;
- React;
- TypeScript;
- Tailwind CSS or CSS Modules;
- KaTeX for formulas;
- JSXGraph, Plotly.js, or custom SVG/Canvas visualizations;
- Web Audio API;
- Zustand or React state where appropriate;
- TanStack Query for server state.

## 5.3 Backend

For the MVP:

- Next.js server routes or a lightweight API service;
- PostgreSQL;
- Prisma or Drizzle ORM;
- Auth.js;
- Zod validation.

A later Java backend migration is allowed, but should not block the MVP.

## 5.4 Symbolic mathematics service

Use a separate Python service:

- FastAPI;
- SymPy;
- Pydantic;
- pytest.

Responsibilities:

- expression parsing;
- simplification;
- equivalence checking;
- differentiation;
- integration;
- equation solving;
- numerical sampling;
- domain checking.

## 5.5 Deployment

Initial deployment:

- Docker Compose;
- PostgreSQL container;
- web container;
- symbolic service container.

Keep deployment compatible with a low-cost VPS.

---

# 6. Repository Structure

```text
engineering-math-platform/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── lib/
│   │   └── tests/
│   └── symbolic-service/
│       ├── app/
│       ├── tests/
│       └── pyproject.toml
├── packages/
│   ├── curriculum/
│   ├── exercise-engine/
│   ├── learner-model/
│   ├── interactive-labs/
│   ├── math-renderer/
│   ├── shared-types/
│   └── validation/
├── content/
│   ├── lessons/
│   ├── exercises/
│   ├── skill-graph/
│   ├── audio-contexts/
│   └── mechanics-contexts/
├── prisma/
├── docs/
├── scripts/
├── docker-compose.yml
├── turbo.json
├── package.json
└── README.md
```

---

# 7. Core Domain Model

## 7.1 Skill

```ts
export interface Skill {
  id: string;
  title: string;
  description: string;
  prerequisites: string[];
  category:
    | "foundation"
    | "calculus"
    | "linear-algebra"
    | "differential-equations"
    | "statistics"
    | "dsp"
    | "numerical-methods";
  masteryThreshold: number;
}
```

## 7.2 Lesson

```ts
export interface Lesson {
  id: string;
  title: string;
  summary: string;
  skillIds: string[];
  prerequisiteLessonIds: string[];
  estimatedMinutes: number;
  sections: LessonSection[];
  exerciseTemplateIds: string[];
  labIds: string[];
}
```

## 7.3 Lesson section

```ts
export type LessonSection =
  | RealWorldProblemSection
  | IntuitionSection
  | FormulaSection
  | InteractiveSection
  | WorkedExampleSection
  | GuidedExerciseSection
  | ReflectionSection;
```

## 7.4 Exercise template

```ts
export interface ExerciseTemplate {
  id: string;
  version: number;
  title: string;
  skillIds: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  context: "abstract" | "audio" | "mechanics" | "electronics";
  parameters: Record<string, ParameterDefinition>;
  promptTemplate: string;
  answerType:
    | "numeric"
    | "expression"
    | "multiple-choice"
    | "ordered-steps"
    | "graph-point"
    | "interval"
    | "free-text";
  solution: SolutionDefinition;
  hints: HintDefinition[];
  validators: ValidatorDefinition[];
  unit?: string;
  metadata?: Record<string, unknown>;
}
```

## 7.5 Parameter definitions

```ts
export type ParameterDefinition =
  IntegerParameter | DecimalParameter | ChoiceParameter | DerivedParameter;
```

Example:

```json
{
  "initialAmplitude": {
    "type": "integer",
    "min": 1,
    "max": 10,
    "exclude": [0]
  },
  "timeConstant": {
    "type": "decimal",
    "min": 0.1,
    "max": 2,
    "step": 0.1
  }
}
```

## 7.6 Exercise instance

```ts
export interface ExerciseInstance {
  id: string;
  templateId: string;
  templateVersion: number;
  seed: string;
  generatedParameters: Record<string, number | string>;
  renderedPrompt: string;
  expectedAnswer: unknown;
  createdAt: string;
}
```

## 7.7 Attempt

```ts
export interface ExerciseAttempt {
  id: string;
  userId: string;
  exerciseInstanceId: string;
  answer: unknown;
  isCorrect: boolean;
  score: number;
  durationMs: number;
  usedHintIds: string[];
  errorCategory?: string;
  submittedAt: string;
}
```

## 7.8 Learner skill state

```ts
export interface LearnerSkillState {
  userId: string;
  skillId: string;
  mastery: number;
  confidence: number;
  attempts: number;
  correctAttempts: number;
  lastPracticedAt?: string;
  nextReviewAt?: string;
  errorPatterns: string[];
  contextScores: {
    abstract?: number;
    audio?: number;
    mechanics?: number;
    electronics?: number;
  };
}
```

---

# 8. Exercise Engine Requirements

The exercise engine must be deterministic for a given template version and seed.

## Responsibilities

- generate parameters;
- enforce domain constraints;
- compute derived parameters;
- render prompts;
- generate expected answers;
- expose hint chains;
- select validators;
- classify common errors;
- support reproducible debugging;
- produce metadata for analytics.

## Seed behavior

The same:

- template ID;
- template version;
- random seed;

must produce the same exercise instance.

## Constraint examples

The generator must prevent:

- division by zero;
- invalid logarithm arguments;
- negative values under real square roots;
- ambiguous solutions;
- physically meaningless values;
- invalid units;
- values that produce poor pedagogy;
- numerical instability in demonstrations.

## Example exercise template

```json
{
  "id": "exponential-decay-basic",
  "version": 1,
  "title": "Exponential amplitude decay",
  "skillIds": ["exponential-functions", "time-constant"],
  "difficulty": 2,
  "context": "audio",
  "parameters": {
    "initialAmplitude": {
      "type": "integer",
      "min": 2,
      "max": 10
    },
    "timeConstant": {
      "type": "decimal",
      "min": 0.2,
      "max": 2,
      "step": 0.1
    },
    "time": {
      "type": "decimal",
      "min": 0.1,
      "max": 3,
      "step": 0.1
    }
  },
  "promptTemplate": "An envelope starts at {{initialAmplitude}} and follows A(t)=A0*exp(-t/tau). What is the amplitude at t={{time}} s if tau={{timeConstant}} s?",
  "answerType": "numeric",
  "solution": {
    "type": "formula",
    "expression": "initialAmplitude * exp(-time / timeConstant)"
  },
  "hints": [
    {
      "id": "identify-formula",
      "text": "Substitute the given values into the exponential decay formula."
    },
    {
      "id": "evaluate-exponent",
      "text": "Calculate -t/tau first."
    }
  ],
  "validators": [
    {
      "type": "numeric-tolerance",
      "absoluteTolerance": 0.001
    }
  ]
}
```

---

# 9. Symbolic Validation API

Create a FastAPI service with the following endpoints.

## 9.1 Expression equivalence

`POST /equivalence`

Request:

```json
{
  "expected": "x**2 / 2",
  "actual": "0.5*x**2",
  "variables": ["x"],
  "domain": "real"
}
```

Response:

```json
{
  "equivalent": true,
  "method": "symbolic-simplification",
  "details": null
}
```

## 9.2 Differentiate

`POST /differentiate`

## 9.3 Integrate

`POST /integrate`

## 9.4 Solve equation

`POST /solve`

## 9.5 Numerical comparison

`POST /numerical-compare`

## 9.6 Domain validation

`POST /validate-domain`

## Required safety

- never execute arbitrary Python;
- parse expressions using a strict whitelist;
- limit expression size;
- limit solve complexity;
- add timeouts;
- reject unsupported symbols and functions;
- sanitize all user input.

---

# 10. Answer Validation

Support multiple validator types.

## Numeric

- absolute tolerance;
- relative tolerance;
- unit-aware comparison.

## Symbolic

- simplify expected minus actual;
- numerical sample fallback;
- domain-aware checking;
- expression normalization.

## Multiple choice

- exact option identity.

## Ordered steps

- expected sequence;
- partial credit;
- alternate valid paths where authored.

## Graph interactions

- point tolerance;
- curve-shape tolerance;
- interval selection.

## Free text

Do not use an LLM as the sole correctness validator.

Free text should be used mainly for:

- reflection;
- interpretation;
- self-explanation;
- optional AI feedback.

---

# 11. Learner Model

The learner model should estimate mastery per skill.

## Initial version

Use a simple weighted score based on:

- correctness;
- difficulty;
- hints used;
- response time;
- recency;
- repeated error pattern;
- context transfer.

Example conceptual update:

```text
new_mastery =
  clamp(
    old_mastery
    + correctness_weight
    * difficulty_weight
    * hint_penalty
    * recency_factor,
    0,
    1
  )
```

Do not overengineer the first version.

## Later options

- Bayesian Knowledge Tracing;
- Item Response Theory;
- Deep Knowledge Tracing;
- contextual mastery models.

## Context transfer

Track whether a skill is understood in:

- abstract context;
- audio context;
- mechanical context;
- electronics context.

A user should not be marked fully competent if they can only repeat one familiar example.

---

# 12. Review Scheduling

Implement a basic spaced-repetition scheduler.

A skill should return for review when:

- mastery is below threshold;
- it has not been practiced recently;
- the learner made repeated errors;
- context transfer is weak;
- a prerequisite skill has decayed.

The first version may use an SM-2-inspired algorithm, but the scheduling unit should be a mathematical skill, not only a flashcard.

---

# 13. Diagnostic Assessment

The diagnostic should be adaptive.

## Goals

- avoid forcing the user through all high-school mathematics;
- identify missing prerequisites;
- distinguish computational mistakes from conceptual gaps;
- produce a proposed starting path.

## Assessment dimensions

- algebra;
- functions;
- logarithms;
- trigonometry;
- graph interpretation;
- derivatives;
- integrals;
- vectors;
- probability basics.

## Result

The result page should show:

- strong areas;
- weak areas;
- uncertain areas;
- recommended starting lesson;
- prerequisite repair lessons;
- estimated initial path.

---

# 14. Interactive Lab Components

Build reusable components rather than lesson-specific one-offs.

## MVP components

### Function Plotter

Features:

- one or more functions;
- zoom and pan;
- axes;
- labels;
- highlighted points;
- derivative overlay;
- tangent line;
- parameter sliders.

### Exponential Decay Lab

Features:

- initial value;
- time constant;
- interactive curve;
- audio envelope preview;
- visual marker at one time constant;
- comparison of multiple curves.

### Decibel Lab

Features:

- amplitude ratio;
- power ratio;
- dB conversion;
- logarithmic scale;
- audible gain preview;
- clipping warning.

### Derivative Visualizer

Features:

- draggable point;
- secant line;
- tangent limit;
- numerical slope;
- analytic slope;
- animated convergence.

### Audio Envelope Lab

Features:

- attack;
- release;
- threshold;
- generated tone or sample;
- envelope graph;
- gain-reduction graph;
- playback;
- reset.

### Numerical Derivative Lab

Features:

- selectable function;
- finite-difference step size;
- forward difference;
- backward difference;
- central difference;
- error visualization.

## Later components

- vector visualizer;
- matrix transformation;
- complex plane;
- spectrum viewer;
- convolution explorer;
- pole-zero editor;
- Fourier series builder;
- ODE solver comparison;
- probability distribution playground;
- regression lab.

---

# 15. Audio Architecture

Use the Web Audio API.

## Requirements

- safe output levels;
- master gain control;
- mute button;
- no autoplay;
- visual warning before loud examples;
- deterministic generated tones where possible;
- sample assets with appropriate licensing;
- clean separation between DSP simulation and UI.

## Initial audio examples

- sine wave;
- amplitude scaling;
- exponential envelope;
- simple attack/release;
- soft clipping;
- transient pulse;
- noise burst.

---

# 16. Content Format

Lessons should be stored as structured content, not hardcoded React pages.

Use MDX or structured JSON/YAML.

Recommended hybrid:

- MDX for authored explanation;
- JSON/YAML for exercises;
- TypeScript registry for interactive components.

Example lesson front matter:

```yaml
id: exponential-decay
title: Exponential Decay and Time Constants
skills:
  - exponential-functions
  - time-constant
prerequisites:
  - functions-basics
  - exponents-basics
estimatedMinutes: 35
labs:
  - exponential-decay-lab
exercises:
  - exponential-decay-basic
  - time-constant-interpretation
```

---

# 17. User Experience

## Main screens

### Dashboard

- current learning path;
- next recommended lesson;
- current streak;
- skills needing review;
- recent progress;
- estimated mastery by module.

### Skill Map

- graph of skills;
- prerequisites;
- locked/unlocked state;
- mastery level;
- context competence.

### Lesson View

- explanation;
- formula rendering;
- interactive labs;
- guided exercises;
- navigation;
- save progress.

### Exercise Session

- one exercise at a time;
- hint button;
- answer input;
- feedback;
- explanation;
- retry;
- show alternative context.

### Diagnostic View

- adaptive questions;
- progress estimate;
- no exact total question count required;
- final recommended path.

### Review Queue

- due skills;
- mixed contexts;
- short sessions;
- error-focused review.

---

# 18. Error Classification

Create an extensible error-classification system.

Examples:

- arithmetic-error;
- sign-error;
- algebraic-rearrangement-error;
- forgotten-chain-rule;
- wrong-logarithm-rule;
- unit-conversion-error;
- confused-amplitude-and-power-db;
- derivative-vs-function-confusion;
- local-vs-global-extremum;
- numerical-rounding-error;
- concept-not-recognized-in-new-context.

The initial version may use deterministic heuristics.

Examples:

- compare against known wrong expressions;
- detect missing inner derivative;
- detect wrong decibel multiplier;
- detect sign reversal;
- detect omitted integration constant.

---

# 19. Testing Requirements

## Unit tests

Test:

- parameter generation;
- deterministic seeds;
- constraint handling;
- answer validation;
- tolerance behavior;
- mastery updates;
- review scheduling;
- content parsing;
- unit conversion;
- error classifiers.

## Property-based tests

Use property-based testing for exercise templates.

For each template:

- generate many seeds;
- validate parameter domains;
- ensure expected answer exists;
- ensure no invalid expressions;
- ensure validators accept the expected answer;
- ensure obvious wrong answers are rejected;
- ensure units remain consistent.

## Integration tests

Test:

- lesson completion;
- exercise submission;
- symbolic-service calls;
- progress persistence;
- diagnostic flow;
- review queue generation.

## End-to-end tests

Use Playwright for:

- onboarding;
- diagnostic;
- completing a lesson;
- interactive lab use;
- submitting correct and incorrect answers;
- returning to the dashboard;
- restoring progress.

## Content validation CI

Create a script:

```bash
pnpm validate:content
```

It must:

- parse all lessons;
- validate references;
- validate skill prerequisites;
- detect circular dependencies;
- instantiate exercise templates with multiple seeds;
- call symbolic validation;
- fail on invalid content.

---

# 20. Database Model

Minimum entities:

- User
- Skill
- Lesson
- ExerciseTemplateMetadata
- ExerciseInstance
- ExerciseAttempt
- LearnerSkillState
- LessonProgress
- ReviewItem
- DiagnosticSession
- DiagnosticAnswer

Exercise content itself may remain version-controlled in the repository.

Database records should reference:

- template ID;
- template version;
- seed.

Do not store only rendered prompts because reproducibility is required.

---

# 21. Security Requirements

- validate all API input with Zod or Pydantic;
- never evaluate arbitrary JavaScript;
- never execute arbitrary Python;
- whitelist mathematical functions;
- rate-limit expensive symbolic operations;
- set expression length limits;
- add symbolic-service timeouts;
- protect user progress endpoints;
- use secure session cookies;
- add CSRF protection where applicable;
- do not expose internal stack traces;
- log failed symbolic operations safely.

---

# 22. Accessibility

The platform should support:

- keyboard navigation;
- screen-reader-friendly text;
- alt descriptions for visualizations;
- high contrast;
- reduced-motion preference;
- mathematical content rendered accessibly;
- non-audio alternatives for audio examples;
- text description of graphs;
- color-independent state indicators.

---

# 23. External Content and Licensing

Do not copy external educational content into the repository without explicit license review.

Potential sources to evaluate:

- WeBWorK Open Problem Library;
- MIT OpenCourseWare;
- OpenStax;
- other openly licensed university materials.

For every imported or adapted item, store:

- source;
- original author;
- license;
- source URL;
- modification note;
- attribution text.

Create:

```text
content/licenses/
```

and maintain an attribution registry.

Do not automatically ingest complete textbooks into an LLM workflow.

The safest MVP approach is:

- use open resources as curriculum references;
- author original lesson explanations;
- author original audio-context exercises;
- adapt only clearly licensed tasks;
- keep attribution metadata.

---

# 24. AI Tutor Boundary

The AI tutor is not required for the MVP.

When added, it must:

- receive the lesson context;
- receive the expected concept;
- receive structured attempt information;
- explain without immediately revealing the answer;
- clearly mark uncertain responses;
- never override deterministic validators;
- avoid claiming a mathematically false result is correct.

The tutor should preferably use a tool interface:

```ts
interface TutorContext {
  lessonId: string;
  skillIds: string[];
  exerciseTemplateId?: string;
  generatedParameters?: Record<string, unknown>;
  expectedConcepts: string[];
  learnerAnswer?: unknown;
  validatorResult?: ValidatorResult;
  errorCategory?: string;
}
```

---

# 25. Implementation Phases

## Phase 1: Repository and infrastructure

Deliver:

- monorepo;
- web application;
- symbolic service;
- PostgreSQL;
- Docker Compose;
- shared types;
- CI;
- linting;
- testing.

Acceptance criteria:

- all services start with one command;
- health checks pass;
- web can call symbolic service;
- database migrations work;
- CI passes.

## Phase 2: Curriculum and exercise domain

Deliver:

- skill schema;
- lesson schema;
- exercise-template schema;
- content loader;
- prerequisite graph;
- seed-based generator;
- validators.

Acceptance criteria:

- sample curriculum loads;
- invalid references fail CI;
- exercise generation is deterministic;
- templates pass property tests.

## Phase 3: First vertical lesson

Implement:

**Exponential Decay and Time Constants**

Include:

- real-world audio example;
- interactive graph;
- audio envelope;
- formal formula;
- guided example;
- at least five exercise templates;
- symbolic or numerical validation;
- progress persistence.

Acceptance criteria:

- user can complete lesson end to end;
- progress appears on dashboard;
- exercise retries work;
- hints are tracked;
- audio can be muted.

## Phase 4: MVP curriculum

Implement all MVP lessons.

Acceptance criteria:

- 10-15 lessons;
- 30-50 templates;
- skill prerequisites;
- review queue;
- diagnostic assessment;
- dashboard.

## Phase 5: Adaptive behavior

Deliver:

- learner mastery updates;
- error patterns;
- context scores;
- review scheduling;
- recommended next lesson.

## Phase 6: Hardening

Deliver:

- accessibility review;
- performance tuning;
- security review;
- complete tests;
- content validation;
- deployment documentation;
- backup strategy.

---

# 26. First Vertical Slice Detailed Specification

## Lesson title

**Exponential Decay, Time Constants, and Audio Envelopes**

## Learning objectives

The learner should be able to:

- recognize exponential decay;
- interpret a time constant;
- calculate a value at a given time;
- understand why decay is not linear;
- connect the formula to compressor release;
- compare continuous and discrete approximations;
- estimate a time constant from measurements.

## Lesson sections

### Section 1: Real-world problem

Show a compressor release envelope that approaches zero.

Question:

Why does the envelope fall quickly at first and slowly later?

### Section 2: Interactive observation

Controls:

- initial amplitude;
- time constant;
- duration;
- linear/exponential comparison.

### Section 3: Intuitive explanation

Explain proportional change:

The rate of decrease depends on how much remains.

### Section 4: Formal model

```math
A(t) = A_0 e^{-t/\tau}
```

Explain every symbol.

### Section 5: Time constant

Show:

```math
A(\tau) = A_0 e^{-1}
```

Explain the approximately 36.8% remaining value.

### Section 6: Audio context

Apply the envelope to a tone.

Controls:

- release;
- initial level;
- play;
- mute;
- loop.

### Section 7: Guided exercise

Substitute values step by step.

### Section 8: Independent exercises

Include:

- calculate remaining amplitude;
- solve for time;
- compare two time constants;
- identify a graph;
- estimate time constant from data.

### Section 9: Discrete approximation

Introduce:

```math
y[n] = \alpha y[n-1]
```

Relate:

```math
\alpha = e^{-T/\tau}
```

Do not go deeply into z-transforms yet.

### Section 10: Reflection

Ask:

- why is a linear release different;
- what changes when sample rate changes;
- why must the coefficient be recalculated.

---

# 27. Codex Working Rules

Codex should follow these rules while implementing.

## General

- inspect the repository before editing;
- make small, reviewable commits;
- preserve strict typing;
- avoid large undocumented abstractions;
- write tests with each feature;
- update documentation with architectural changes;
- do not silently change domain schemas;
- prefer deterministic behavior;
- log assumptions in `docs/decisions/`.

## Before completing a task

Codex must:

1. run formatting;
2. run linting;
3. run unit tests;
4. run content validation;
5. run relevant integration tests;
6. summarize modified files;
7. document known limitations.

## Definition of done

A feature is done only if:

- implementation exists;
- tests exist;
- acceptance criteria pass;
- documentation is updated;
- no known critical error remains;
- content references are valid;
- the feature works through the UI where applicable.

---

# 28. Initial Codex Task List

## Task 1

Initialize the monorepo and infrastructure.

## Task 2

Create shared domain schemas using TypeScript and Zod.

## Task 3

Create the Python symbolic service.

## Task 4

Implement deterministic exercise generation.

## Task 5

Implement numeric and symbolic validators.

## Task 6

Implement skill graph loading and validation.

## Task 7

Create the lesson-content loader.

## Task 8

Create the base design system and layout.

## Task 9

Build the function plotter.

## Task 10

Build the exponential-decay interactive lab.

## Task 11

Build the audio-envelope demo.

## Task 12

Implement exercise session UI.

## Task 13

Implement persistence and progress tracking.

## Task 14

Implement the first complete lesson.

## Task 15

Add property-based content tests.

## Task 16

Add Docker Compose and deployment documentation.

---

# 29. Non-Functional Requirements

## Performance

- initial lesson load under reasonable broadband should feel immediate;
- interactive graph updates should target 60 FPS;
- audio interactions should respond without noticeable delay;
- expensive symbolic operations should run asynchronously from the UI request lifecycle where practical;
- cache safe symbolic results.

## Maintainability

- curriculum content separate from UI implementation;
- exercise engine independent of Next.js;
- symbolic service behind a typed client;
- version all exercise templates;
- use ADR documents for significant decisions.

## Observability

Add:

- structured logs;
- symbolic-operation timing;
- failed exercise-generation metrics;
- validation failure metrics;
- health endpoints.

---

# 30. Final Product Vision

The final system should help the learner progress from uncertain, partially forgotten mathematical foundations to confident applied mathematical reasoning.

The desired end state is not pure mathematical specialization.

The learner should be able to:

- understand mathematical models behind DSP algorithms;
- read engineering papers with less difficulty;
- discuss stability, optimization, statistics, and differential equations;
- reason about continuous and discrete systems;
- design and validate audio algorithms more independently;
- communicate effectively with applied mathematicians and researchers;
- recognize the same mathematical structure across audio, electronics, mechanics, and numerical computing.

The MVP must prove this teaching approach using one polished, end-to-end module before expanding the curriculum.
