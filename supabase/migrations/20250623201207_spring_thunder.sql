/*
  # Emma Planner Onboarding Schema

  1. New Tables
    - `planner_onboarding_sessions`
      - Tracks user progress through Emma's onboarding
      - Stores conversation history and preferences
    - `will_drafts`
      - Stores will drafts and AI suggestions
    - `executor_personal_notes`
      - Personal notes for executors created during onboarding

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create planner_onboarding_sessions table
CREATE TABLE IF NOT EXISTS planner_onboarding_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  planner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  current_step integer DEFAULT 1,
  conversation_history jsonb DEFAULT '[]',
  completed_steps jsonb DEFAULT '{}',
  preferences jsonb DEFAULT '{}',
  started_at timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE planner_onboarding_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own onboarding sessions"
  ON planner_onboarding_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = planner_id)
  WITH CHECK (auth.uid() = planner_id);

-- Create will_drafts table
CREATE TABLE IF NOT EXISTS will_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  planner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  version integer DEFAULT 1,
  content text,
  ai_suggestions jsonb,
  is_final boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE will_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own will drafts"
  ON will_drafts
  FOR ALL
  TO authenticated
  USING (auth.uid() = planner_id)
  WITH CHECK (auth.uid() = planner_id);

-- Create executor_personal_notes table
CREATE TABLE IF NOT EXISTS executor_personal_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  planner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  executor_id uuid REFERENCES executors(id) ON DELETE CASCADE,
  note_content text NOT NULL,
  ai_assistance_used boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE executor_personal_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own executor notes"
  ON executor_personal_notes
  FOR ALL
  TO authenticated
  USING (auth.uid() = planner_id)
  WITH CHECK (auth.uid() = planner_id);

-- Add triggers for updated_at
CREATE TRIGGER update_planner_onboarding_sessions_updated_at
  BEFORE UPDATE ON planner_onboarding_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_will_drafts_updated_at
  BEFORE UPDATE ON will_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_executor_personal_notes_updated_at
  BEFORE UPDATE ON executor_personal_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();