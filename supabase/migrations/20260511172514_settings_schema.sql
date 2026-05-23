-- ============================================================
-- Migration: settings_schema
-- Description:
--   1. Add social_links JSONB column to profiles
--   2. Create user_preferences table
--   3. Enable RLS + write policies on user_preferences
-- ============================================================

-- ----------------------------------------------------------------
-- 1. profiles — add social_links column
-- ----------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

-- ----------------------------------------------------------------
-- 2. user_preferences — new table
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language    TEXT        NOT NULL DEFAULT 'en',
  timezone    TEXT        NOT NULL DEFAULT 'UTC',
  date_format TEXT        NOT NULL DEFAULT 'MM/DD/YYYY',
  font_size   TEXT        NOT NULL DEFAULT 'default'
                          CHECK (font_size IN ('small', 'default', 'large')),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_preferences_user_id_key UNIQUE (user_id)
);

-- Keep updated_at current on every update
CREATE OR REPLACE FUNCTION public.set_user_preferences_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER trg_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_user_preferences_updated_at();

-- ----------------------------------------------------------------
-- 3. RLS on user_preferences
-- ----------------------------------------------------------------
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_preferences_select_own"
  ON public.user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_preferences_insert_own"
  ON public.user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_preferences_update_own"
  ON public.user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_preferences_delete_own"
  ON public.user_preferences
  FOR DELETE
  USING (auth.uid() = user_id);
