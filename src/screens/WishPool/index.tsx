import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import AuthModal from '../AuthModal'

interface Wish {
  id: string
  user_id: string
  content: string
  vote_count: number
  created_at: string
}

export default function WishPool() {
  const goToStart = useGameStore(s => s.fullReset)
  const { user } = useAuth()

  const [wishes, setWishes] = useState<Wish[]>([])
  const [myVotes, setMyVotes] = useState<Set<string>>(new Set())
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [pendingVoteId, setPendingVoteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWishes()
  }, [])

  useEffect(() => {
    if (user) fetchMyVotes()
    else setMyVotes(new Set())
  }, [user])

  // After login, resume pending vote
  useEffect(() => {
    if (user && pendingVoteId) {
      const id = pendingVoteId
      setPendingVoteId(null)
      toggleVote(id, false)
    }
  }, [user, pendingVoteId])

  async function fetchWishes() {
    setLoading(true)
    const { data } = await supabase
      .from('zerohour_wishes')
      .select('*')
      .order('vote_count', { ascending: false })
    setWishes(data ?? [])
    setLoading(false)
  }

  async function fetchMyVotes() {
    if (!user) return
    const { data } = await supabase
      .from('zerohour_wish_votes')
      .select('wish_id')
      .eq('user_id', user.id)
    setMyVotes(new Set((data ?? []).map((v: { wish_id: string }) => v.wish_id)))
  }

  async function submitWish() {
    if (!user) { setShowAuthModal(true); return }
    const trimmed = content.trim()
    if (trimmed.length < 5 || trimmed.length > 200) {
      setSubmitError('請輸入 5～200 字的內容')
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    const { error } = await supabase
      .from('zerohour_wishes')
      .insert({ user_id: user.id, content: trimmed })
    if (error) {
      setSubmitError('提交失敗，請稍後再試')
    } else {
      setContent('')
      await fetchWishes()
    }
    setSubmitting(false)
  }

  async function toggleVote(wishId: string, hasVoted: boolean) {
    if (!user) {
      setPendingVoteId(wishId)
      setShowAuthModal(true)
      return
    }
    if (hasVoted) {
      await supabase
        .from('zerohour_wish_votes')
        .delete()
        .eq('user_id', user.id)
        .eq('wish_id', wishId)
      setMyVotes(prev => { const s = new Set(prev); s.delete(wishId); return s })
      setWishes(prev => prev.map(w => w.id === wishId ? { ...w, vote_count: w.vote_count - 1 } : w))
    } else {
      await supabase
        .from('zerohour_wish_votes')
        .insert({ user_id: user.id, wish_id: wishId })
      setMyVotes(prev => new Set(prev).add(wishId))
      setWishes(prev => prev.map(w => w.id === wishId ? { ...w, vote_count: w.vote_count + 1 } : w))
    }
  }

  function formatDate(iso: string) {
    const d = new Date(iso)
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col px-4 py-8 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-orange-500 text-xs font-bold tracking-widest mb-1">// WISH POOL</p>
        <h1 className="text-white font-black text-2xl mb-1">許願池</h1>
        <p className="text-gray-400 text-sm mb-6">希望看到的急難情境主題</p>
      </motion.div>

      {/* Submit form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6"
      >
        <p className="text-gray-400 text-xs font-bold tracking-wide mb-3">
          {user ? '// 提交許願' : '// 登入後可提交許願'}
        </p>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          disabled={!user}
          placeholder={user ? '描述你希望看到的急難情境（5～200字）…' : '登入後即可提交許願…'}
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white text-sm placeholder-gray-600 resize-none focus:outline-none focus:border-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-gray-600 text-xs">{content.length} / 200</span>
          {submitError && <span className="text-red-400 text-xs">{submitError}</span>}
          {!user ? (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold rounded-lg transition-colors"
            >
              登入以提交
            </button>
          ) : (
            <button
              onClick={submitWish}
              disabled={submitting || content.trim().length < 5}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-40"
            >
              {submitting ? '送出中…' : '送出'}
            </button>
          )}
        </div>
      </motion.div>

      {/* Wish list */}
      <div className="space-y-3 flex-1">
        {loading ? (
          <p className="text-gray-600 text-sm text-center py-8">載入中…</p>
        ) : wishes.length === 0 ? (
          <p className="text-gray-600 text-sm text-center py-8">還沒有許願，成為第一個！</p>
        ) : (
          wishes.map((wish, i) => {
            const hasVoted = myVotes.has(wish.id)
            return (
              <motion.div
                key={wish.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.04 }}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-start gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-gray-200 text-sm leading-relaxed">{wish.content}</p>
                  <p className="text-gray-600 text-xs mt-1">{formatDate(wish.created_at)}</p>
                </div>
                <button
                  onClick={() => toggleVote(wish.id, hasVoted)}
                  className={`flex flex-col items-center gap-0.5 min-w-[40px] pt-0.5 transition-colors ${hasVoted ? 'text-red-400' : 'text-gray-600 hover:text-red-400'}`}
                >
                  <span className="text-xl leading-none">{hasVoted ? '❤️' : '🤍'}</span>
                  <span className="text-xs font-bold">{wish.vote_count}</span>
                </button>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Back button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={goToStart}
        className="w-full mt-8 py-3 border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-gray-200 rounded-lg text-sm transition-colors"
      >
        返回首頁
      </motion.button>

      {showAuthModal && (
        <AuthModal
          onSuccess={() => setShowAuthModal(false)}
          onClose={() => {
            setShowAuthModal(false)
            setPendingVoteId(null)
          }}
        />
      )}
    </div>
  )
}
