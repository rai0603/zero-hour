import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export interface ZerohourResultRow {
  id?: string
  user_id?: string
  session_id: string
  scenario_id: string
  grade: string
  score: number
  question_count: number
  profile: Record<string, unknown>
  question_history: unknown[]
  bonus_events: unknown[]
  time_taken: number
  unlocked: boolean
  paid_at?: string | null
  payment_id?: string | null
  created_at?: string
}
