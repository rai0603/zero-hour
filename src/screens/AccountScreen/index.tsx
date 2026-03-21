import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { useGameStore } from '../../store/gameStore'

interface ResultRow {
  id: string
  scenario_id: string
  grade: string
  score: number
  question_count: number
  time_taken: number
  created_at: string
}

const scenarioNames: Record<string, string> = {
  S1: '大地震',
  S2: '海嘯警報',
  S3: '戰爭衝突',
  S4: '異常天候',
  S5: '恐怖攻擊',
  S6: '疫情感染',
  S7: '不明生物',
}

const gradeColors: Record<string, string> = {
  S: 'text-yellow-400',
  A: 'text-green-400',
  B: 'text-blue-400',
  C: 'text-orange-400',
  D: 'text-red-400',
  F: 'text-gray-500',
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function AccountScreen() {
  const { user, signOut } = useAuth()
  const goToStart = useGameStore(s => s.goToStart)
  const [results, setResults] = useState<ResultRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    supabase
      .from('zerohour_results')
      .select('id, scenario_id, grade, score, question_count, time_taken, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setResults(data ?? [])
        setLoading(false)
      })
  }, [user])

  async function handleSignOut() {
    await signOut()
    goToStart()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-950 flex flex-col px-4 py-6 max-w-lg mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToStart}
          className="text-gray-500 hover:text-gray-300 text-sm transition-colors flex items-center gap-1"
        >
          ← 返回
        </button>
        <p className="text-orange-500 text-xs font-bold tracking-widest">// 會員中心</p>
      </div>

      {user ? (
        <>
          {/* 帳號資訊 */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-sm mb-0.5">{user.email}</p>
                <p className="text-gray-500 text-xs">
                  {user.app_metadata?.provider === 'google' ? '🔵 Google 帳號' : '📧 Email 帳號'}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-white rounded-lg text-xs font-bold transition-colors"
              >
                登出
              </button>
            </div>
          </div>

          {/* 測試歷史 */}
          <p className="text-gray-500 text-xs font-bold tracking-wide mb-3">// 測試紀錄</p>

          {loading ? (
            <div className="text-center py-12 text-gray-600 text-sm">載入中…</div>
          ) : results.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
              <p className="text-gray-600 text-sm mb-2">尚無測試紀錄</p>
              <p className="text-gray-700 text-xs">完成情境測試後，結果將自動儲存於此</p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map(r => (
                <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center gap-3">
                  {/* Grade */}
                  <span className={`text-2xl font-black w-8 text-center shrink-0 ${gradeColors[r.grade] ?? 'text-white'}`}>
                    {r.grade}
                  </span>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold">{scenarioNames[r.scenario_id] ?? r.scenario_id}</p>
                    <p className="text-gray-500 text-xs">{r.score} 分・{r.question_count} 題・{formatTime(r.time_taken)}</p>
                  </div>
                  {/* Date */}
                  <p className="text-gray-600 text-xs shrink-0">{formatDate(r.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* 未登入 */
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="text-center">
            <p className="text-5xl mb-4">🔒</p>
            <p className="text-white font-bold text-lg mb-2">登入以查看紀錄</p>
            <p className="text-gray-500 text-sm">登入後可儲存並查看所有測試歷史</p>
          </div>
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors"
          >
            登入 / 註冊
          </button>
        </div>
      )}

      {showAuthModal && (
        <AuthModalInline onClose={() => setShowAuthModal(false)} />
      )}
    </motion.div>
  )
}

// 內嵌 AuthModal（避免循環引用，直接實作）
function AuthModalInline({ onClose }: { onClose: () => void }) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    if (tab === 'login') {
      const { error } = await signInWithEmail(email, password)
      if (error) setError('帳號或密碼錯誤，請再試一次。')
      else onClose()
    } else {
      const { error } = await signUpWithEmail(email, password)
      if (error) setError(error.message)
      else setRegistered(true)
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50 px-4 pb-0" onClick={onClose}>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="bg-gray-900 border border-gray-700 rounded-t-2xl p-6 w-full max-w-sm pb-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <p className="text-orange-500 text-xs font-bold tracking-widest">// 會員登入</p>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-300 text-xl leading-none">×</button>
        </div>

        {registered ? (
          <div className="text-center py-4">
            <p className="text-green-400 font-bold mb-2">✅ 註冊成功！</p>
            <p className="text-gray-400 text-sm">請查收驗證信，驗證後即可登入。</p>
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-5">
              {(['login', 'register'] as const).map(t => (
                <button key={t} onClick={() => { setTab(t); setError(null) }}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${tab === t ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                  {t === 'login' ? '登入' : '註冊'}
                </button>
              ))}
            </div>

            <button onClick={signInWithGoogle}
              className="w-full py-2.5 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded-lg text-sm flex items-center justify-center gap-2 mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              使用 Google {tab === 'login' ? '登入' : '註冊'}
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-700" />
              <span className="text-gray-600 text-xs">或</span>
              <div className="flex-1 h-px bg-gray-700" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="email" placeholder="電子郵件" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500" />
              <input type="password" placeholder="密碼（至少 6 位）" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500" />
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-lg text-sm transition-colors">
                {loading ? '處理中…' : tab === 'login' ? '登入' : '建立帳號'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  )
}
