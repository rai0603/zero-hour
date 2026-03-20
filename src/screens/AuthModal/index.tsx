import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'

interface AuthModalProps {
  onSuccess: () => void
  onClose: () => void
}

export default function AuthModal({ onSuccess, onClose }: AuthModalProps) {
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
      if (error) {
        setError('帳號或密碼錯誤，請再試一次。')
      } else {
        onSuccess()
      }
    } else {
      const { error } = await signUpWithEmail(email, password)
      if (error) {
        setError(error.message)
      } else {
        setRegistered(true)
      }
    }

    setLoading(false)
  }

  async function handleGoogle() {
    await signInWithGoogle()
    // Google OAuth 會跳轉，不需要呼叫 onSuccess
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <p className="text-orange-500 text-xs font-bold tracking-widest">// 儲存紀錄</p>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-300 transition-colors text-lg leading-none">×</button>
          </div>

          {registered ? (
            <div className="text-center py-4">
              <p className="text-green-400 font-bold mb-2">✅ 註冊成功！</p>
              <p className="text-gray-400 text-sm">請查收驗證信，驗證後即可登入儲存你的測試紀錄。</p>
            </div>
          ) : (
            <>
              {/* Tab */}
              <div className="flex gap-2 mb-5">
                {(['login', 'register'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setError(null) }}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
                      tab === t
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {t === 'login' ? '登入' : '註冊'}
                  </button>
                ))}
              </div>

              {/* Google */}
              <button
                onClick={handleGoogle}
                className="w-full py-2.5 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 mb-4"
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                使用 Google 帳號{tab === 'login' ? '登入' : '註冊'}
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-700" />
                <span className="text-gray-600 text-xs">或</span>
                <div className="flex-1 h-px bg-gray-700" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  placeholder="電子郵件"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                />
                <input
                  type="password"
                  placeholder="密碼（至少 6 位）"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                />

                {error && (
                  <p className="text-red-400 text-xs">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-lg text-sm transition-colors"
                >
                  {loading ? '處理中…' : tab === 'login' ? '登入' : '建立帳號'}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
