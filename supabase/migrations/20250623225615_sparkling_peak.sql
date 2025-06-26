-- Check if tables already exist before creating them
DO $$ 
BEGIN
  -- Create executor_onboarding_sessions table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'executor_onboarding_sessions') THEN
    CREATE TABLE executor_onboarding_sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      executor_id uuid NOT NULL REFERENCES executors(id) ON DELETE CASCADE,
      planner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      trigger_type text NOT NULL CHECK (trigger_type IN ('invitation', 'death_notification')),
      current_step integer DEFAULT 1,
      conversation_history jsonb DEFAULT '[]',
      completed_steps jsonb DEFAULT '{}',
      completed_tasks jsonb DEFAULT '[]',
      next_priority_tasks jsonb DEFAULT '[]',
      death_verified boolean DEFAULT false,
      death_certificate_uploaded boolean DEFAULT false,
      last_session_summary text,
      session_count integer DEFAULT 1,
      total_time_spent interval DEFAULT '00:00:00',
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      last_accessed_at timestamptz DEFAULT now()
    );

    ALTER TABLE executor_onboarding_sessions ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Create emma_conversations table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'emma_conversations') THEN
    CREATE TABLE emma_conversations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id uuid REFERENCES executor_onboarding_sessions(id) ON DELETE CASCADE,
      message_type text NOT NULL CHECK (message_type IN ('user', 'emma', 'system')),
      content text NOT NULL,
      metadata jsonb,
      step_context text,
      is_return_session boolean DEFAULT false,
      timestamp timestamptz DEFAULT now()
    );

    ALTER TABLE emma_conversations ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Create executor_task_completions table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'executor_task_completions') THEN
    CREATE TABLE executor_task_completions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id uuid REFERENCES executor_onboarding_sessions(id) ON DELETE CASCADE,
      task_category text NOT NULL,
      task_name text NOT NULL,
      completed_at timestamptz DEFAULT now(),
      details jsonb,
      next_actions jsonb
    );

    ALTER TABLE executor_task_completions ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist
DO $$
BEGIN
  -- Drop policies if they exist
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'executor_onboarding_sessions' 
    AND policyname = 'Executors can manage their own onboarding sessions'
  ) THEN
    DROP POLICY "Executors can manage their own onboarding sessions" ON executor_onboarding_sessions;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'emma_conversations' 
    AND policyname = 'Executors can manage their own conversations'
  ) THEN
    DROP POLICY "Executors can manage their own conversations" ON emma_conversations;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'executor_task_completions' 
    AND policyname = 'Executors can manage their own task completions'
  ) THEN
    DROP POLICY "Executors can manage their own task completions" ON executor_task_completions;
  END IF;
END $$;

-- Create policies
CREATE POLICY "Executors can manage their own onboarding sessions"
  ON executor_onboarding_sessions
  FOR ALL
  TO authenticated
  USING (
    executor_id IN (
      SELECT id FROM executors 
      WHERE email = auth.email() 
      AND status = 'active'
    )
  )
  WITH CHECK (
    executor_id IN (
      SELECT id FROM executors 
      WHERE email = auth.email() 
      AND status = 'active'
    )
  );

CREATE POLICY "Executors can manage their own conversations"
  ON emma_conversations
  FOR ALL
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM executor_onboarding_sessions
      WHERE executor_id IN (
        SELECT id FROM executors 
        WHERE email = auth.email() 
        AND status = 'active'
      )
    )
  )
  WITH CHECK (
    session_id IN (
      SELECT id FROM executor_onboarding_sessions
      WHERE executor_id IN (
        SELECT id FROM executors 
        WHERE email = auth.email() 
        AND status = 'active'
      )
    )
  );

CREATE POLICY "Executors can manage their own task completions"
  ON executor_task_completions
  FOR ALL
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM executor_onboarding_sessions
      WHERE executor_id IN (
        SELECT id FROM executors 
        WHERE email = auth.email() 
        AND status = 'active'
      )
    )
  )
  WITH CHECK (
    session_id IN (
      SELECT id FROM executor_onboarding_sessions
      WHERE executor_id IN (
        SELECT id FROM executors 
        WHERE email = auth.email() 
        AND status = 'active'
      )
    )
  );

-- Check if trigger exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_executor_onboarding_sessions_updated_at'
  ) THEN
    CREATE TRIGGER update_executor_onboarding_sessions_updated_at
      BEFORE UPDATE ON executor_onboarding_sessions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;