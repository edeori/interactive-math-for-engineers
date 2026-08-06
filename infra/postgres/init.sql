CREATE TABLE IF NOT EXISTS lesson_progress (
  learner_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('started', 'completed')),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (learner_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS exercise_attempt (
  id BIGSERIAL PRIMARY KEY,
  learner_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  template_version INTEGER NOT NULL,
  seed TEXT NOT NULL,
  answer JSONB NOT NULL,
  is_correct BOOLEAN NOT NULL,
  score DOUBLE PRECISION NOT NULL CHECK (score >= 0 AND score <= 1),
  duration_ms INTEGER NOT NULL CHECK (duration_ms >= 0),
  used_hint_ids TEXT[] NOT NULL DEFAULT '{}',
  error_category TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS exercise_attempt_learner_time_idx
  ON exercise_attempt (learner_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS exercise_attempt_template_idx
  ON exercise_attempt (template_id, template_version);

CREATE TABLE IF NOT EXISTS learner_skill_state (
  learner_id TEXT NOT NULL,
  skill_id TEXT NOT NULL,
  mastery DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (mastery >= 0 AND mastery <= 1),
  confidence DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 1),
  attempts INTEGER NOT NULL DEFAULT 0,
  correct_attempts INTEGER NOT NULL DEFAULT 0,
  last_practiced_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  error_patterns JSONB NOT NULL DEFAULT '[]'::jsonb,
  context_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (learner_id, skill_id)
);
