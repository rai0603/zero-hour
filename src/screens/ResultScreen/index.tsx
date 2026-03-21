import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { getGradeInfo } from '../../engine/scoreEngine'
import { generateReport } from '../../utils/generateReport'
import { shareNative, shareToFacebook, shareToInstagram, shareToThreads, downloadCard, copyLink, isMobile } from '../../utils/shareResult'
import ShareCard from '../../components/ShareCard'
import ScoreDistributionChart from '../../components/ScoreDistributionChart'
import RecentResultsTicker from '../../components/RecentResultsTicker'
import { useAuth } from '../../contexts/AuthContext'
import { useProfile } from '../../hooks/useProfile'
import AuthModal from '../AuthModal'
import PaymentModal from '../PaymentModal'

const gradeColors: Record<string, string> = {
  S: 'text-yellow-400',
  A: 'text-green-400',
  B: 'text-blue-400',
  C: 'text-orange-400',
  D: 'text-red-400',
  F: 'text-gray-500',
}

const gradeBarColors: Record<string, string> = {
  S: 'bg-yellow-500',
  A: 'bg-green-500',
  B: 'bg-blue-500',
  C: 'bg-orange-500',
  D: 'bg-red-500',
  F: 'bg-gray-600',
}

export default function ResultScreen() {
  const score = useGameStore(s => s.score)
  const bonusEvents = useGameStore(s => s.bonusEvents)
  const questionHistory = useGameStore(s => s.questionHistory)
  const fullReset = useGameStore(s => s.fullReset)
  const scenarioMeta = useGameStore(s => s.scenarioMeta)
  const selectedScenarioId = useGameStore(s => s.selectedScenarioId)
  const profile = useGameStore(s => s.profile)

  const resultSaved = useGameStore(s => s.resultSaved)
  const saveError = useGameStore(s => s.saveError)
  const saveResult = useGameStore(s => s.saveResult)

  const { user } = useAuth()
  const { unlockedAll } = useProfile()
  const shareCardRef = useRef<HTMLDivElement>(null)
  const [sharing, setSharing] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [shareToast, setShareToast] = useState<string | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [pendingReport, setPendingReport] = useState(false)

  function showToast(msg: string) {
    setShareToast(msg)
    setTimeout(() => setShareToast(null), 3500)
  }

  // 已登入時自動儲存（帶入 display_name / avatar / country）
  const triedSave = useRef(false)
  useEffect(() => {
    if (!user || resultSaved || triedSave.current) return
    triedSave.current = true
    const displayName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      '匿名'
    const avatarUrl = user.user_metadata?.avatar_url ?? undefined
    fetch('https://ipapi.co/country_code/')
      .then(r => r.text())
      .then(country => saveResult(user.id, { displayName, avatarUrl, country: country.trim() }))
      .catch(() => saveResult(user.id, { displayName, avatarUrl }))
  }, [user, resultSaved, saveResult])

  // 登入後若有待產出的報告，繼續走解鎖判斷
  useEffect(() => {
    if (user && pendingReport && selectedScenarioId) {
      setPendingReport(false)
      if (!unlockedAll) {
        setShowPaymentModal(true)
      } else {
        generateReport({ score, questionHistory, bonusEvents, scenarioMeta, selectedScenarioId, profile })
      }
    }
  }, [user, pendingReport, selectedScenarioId, score, questionHistory, bonusEvents, scenarioMeta, profile, unlockedAll])

  const gradeInfo = getGradeInfo(score)
  const { grade, roleTitle, description } = gradeInfo

  const optimalCount = questionHistory.filter(q => q.optionType === 'OPTIMAL').length
  const suboptimalCount = questionHistory.filter(q => q.optionType === 'SUBOPTIMAL').length
  const riskyCount = questionHistory.filter(q => q.optionType === 'RISKY').length
  const total = questionHistory.length

  function handleGenerateReport() {
    if (!selectedScenarioId) return
    // TODO: 上線前恢復付費牆（登入 + unlockedAll 檢查）
    generateReport({ score, questionHistory, bonusEvents, scenarioMeta, selectedScenarioId, profile })
  }

  async function handleShareNative() {
    if (!shareCardRef.current || sharing) return
    setSharing('native')
    try { await shareNative(shareCardRef.current, grade, score) } finally { setSharing(null) }
  }

  async function handleShareFacebook() {
    await shareToFacebook(grade, score)
  }

  async function handleShareInstagram() {
    await shareToInstagram(grade, score)
    if (!isMobile) showToast('已複製連結！請貼到 Instagram 貼文')
  }

  async function handleDownload() {
    if (!shareCardRef.current || sharing) return
    setSharing('dl')
    try { await downloadCard(shareCardRef.current, grade, score) } finally { setSharing(null) }
  }

  async function handleCopyLink() {
    await copyLink(grade, score)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col px-4 py-8 max-w-lg mx-auto">
      {/* 隱藏的截圖元素 */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <ShareCard
          ref={shareCardRef}
          score={score}
          scenarioMeta={scenarioMeta}
          questionHistory={questionHistory}
          bonusEvents={bonusEvents}
        />
      </div>

      {/* Toast 提示 */}
      {shareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-800 border border-gray-600 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-xl max-w-xs text-center">
          {shareToast}
        </div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <p className="text-orange-500 text-xs font-bold tracking-widest mb-4">// 測試結果</p>

        {/* Grade */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2, duration: 0.8 }}
          className={`text-9xl font-black mb-2 ${gradeColors[grade] ?? 'text-white'}`}
        >
          {grade}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-white font-bold text-xl mb-1">{roleTitle}</p>
          <p className="text-gray-400 font-bold text-2xl">{score} <span className="text-base text-gray-600">/ 500 分</span></p>
        </motion.div>
      </motion.div>

      {/* Score bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mb-6"
      >
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(score / 500) * 100}%` }}
            transition={{ delay: 0.7, duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${gradeBarColors[grade] ?? 'bg-white'}`}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>0</span>
          <span>F</span>
          <span>D</span>
          <span>C</span>
          <span>B</span>
          <span>A</span>
          <span>S</span>
          <span>500</span>
        </div>
      </motion.div>

      {/* 最新測試動態跑馬燈 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85 }}
        className="mb-6"
      >
        <RecentResultsTicker />
      </motion.div>

      {/* Score Distribution Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mb-6"
      >
        <ScoreDistributionChart score={score} />
      </motion.div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-5"
      >
        <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="grid grid-cols-3 gap-3 mb-5"
      >
        <div className="bg-green-950/40 border border-green-900/50 rounded-lg p-3 text-center">
          <p className="text-green-400 font-bold text-2xl">{optimalCount}</p>
          <p className="text-gray-500 text-xs">最佳選擇</p>
        </div>
        <div className="bg-yellow-950/40 border border-yellow-900/50 rounded-lg p-3 text-center">
          <p className="text-yellow-400 font-bold text-2xl">{suboptimalCount}</p>
          <p className="text-gray-500 text-xs">次佳選擇</p>
        </div>
        <div className="bg-red-950/40 border border-red-900/50 rounded-lg p-3 text-center">
          <p className="text-red-400 font-bold text-2xl">{riskyCount}</p>
          <p className="text-gray-500 text-xs">高風險</p>
        </div>
      </motion.div>

      {/* Bonuses */}
      {bonusEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-5"
        >
          <p className="text-orange-400 text-xs font-bold tracking-wide mb-3">// 額外獎勵</p>
          <div className="space-y-2">
            {bonusEvents.map((b, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-300">{b.label}</span>
                <span className="text-green-400 font-bold">+{b.points}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Progress: answered questions */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-gray-600 text-xs text-center mb-6"
      >
        共回答 {total} 題・情境 {scenarioMeta.id}：{scenarioMeta.title}
      </motion.p>

      {/* 分享結果區塊 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.25 }}
        className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4"
      >
        <p className="text-gray-500 text-xs font-bold tracking-wide mb-3">// 分享我的結果</p>
        <div className="grid grid-cols-2 gap-2">
          {/* 系統分享 */}
          <button
            onClick={handleShareNative}
            disabled={!!sharing}
            className="col-span-2 flex items-center justify-center gap-2 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
          >
            📤 {sharing === 'native' ? '生成中…' : '系統分享（LINE / 更多）'}
          </button>

          {/* Facebook */}
          <button
            onClick={handleShareFacebook}
            disabled={!!sharing}
            className="flex items-center justify-center gap-2 py-2.5 bg-blue-900/40 hover:bg-blue-900/60 border border-blue-800/60 text-blue-300 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Facebook
          </button>

          {/* Instagram */}
          <button
            onClick={handleShareInstagram}
            disabled={!!sharing}
            className="flex items-center justify-center gap-2 py-2.5 bg-pink-900/40 hover:bg-pink-900/60 border border-pink-800/60 text-pink-300 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            Instagram
          </button>

          {/* Threads */}
          <button
            onClick={() => shareToThreads(grade, score)}
            className="flex items-center justify-center gap-2 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 rounded-lg text-sm font-bold transition-colors"
          >
            <span style={{ fontFamily: 'serif', fontSize: '15px', fontWeight: 900 }}>@</span>
            Threads
          </button>

          {/* 下載圖片 */}
          <button
            onClick={handleDownload}
            disabled={!!sharing}
            className="flex items-center justify-center gap-2 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
          >
            💾 {sharing === 'dl' ? '生成中…' : '下載圖片'}
          </button>

          {/* 複製連結 */}
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg text-sm font-bold transition-colors"
          >
            {copied ? '✅ 已複製' : '🔗 複製連結'}
          </button>
        </div>
      </motion.div>

      {/* 登入儲存紀錄 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.28 }}
        className="mb-4"
      >
        {!user ? (
          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full py-3 bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-orange-600 text-gray-300 hover:text-white rounded-xl text-sm font-bold transition-all"
          >
            🔒 登入以儲存測試紀錄
          </button>
        ) : resultSaved ? (
          <div className="w-full py-3 bg-green-950/40 border border-green-800/50 rounded-xl text-center text-green-400 text-sm font-bold">
            ✅ 紀錄已儲存到你的帳號
          </div>
        ) : saveError ? (
          <div className="w-full py-3 bg-red-950/40 border border-red-800/50 rounded-xl text-center text-red-400 text-xs px-4">
            儲存失敗：{saveError}
          </div>
        ) : (
          <div className="w-full py-3 bg-gray-900 border border-gray-800 rounded-xl text-center text-gray-500 text-sm">
            儲存中…
          </div>
        )}
      </motion.div>

      {/* CTA paid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="bg-orange-950/30 border border-orange-800/50 rounded-xl p-5 mb-5"
      >
        <p className="text-orange-300 font-bold text-sm mb-1">📊 解鎖完整分析報告</p>
        <p className="text-gray-400 text-xs mb-3 leading-relaxed">
          包含逐題解析、個人弱點分析、個人化備災清單，以及學習資源推薦。
        </p>
        <button
          onClick={handleGenerateReport}
          className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg text-sm transition-colors"
        >
          📄 下載完整報告 PDF
        </button>
      </motion.div>

      {/* Replay */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        onClick={fullReset}
        className="w-full py-3 border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-gray-200 rounded-lg text-sm transition-colors"
      >
        重新測試
      </motion.button>

      {/* 贊助版位 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-8 border border-dashed border-gray-700 rounded-xl p-4 text-center"
      >
        <p className="text-gray-600 text-xs font-bold tracking-widest mb-1">// 贊助版位</p>
        <p className="text-gray-500 text-xs mb-3">您的品牌可以出現在這裡，觸及關心台灣防災的受眾</p>
        <a
          href={`mailto:?subject=${encodeURIComponent('零時生存廣告合作洽詢')}&body=${encodeURIComponent('您好，我想了解零時生存（ZERO HOUR）的廣告版位合作方案，請問報價與詳細資訊？')}`}
          onClick={(e) => {
            e.preventDefault()
            window.location.href = `mailto:rai0603@gmail.com?subject=${encodeURIComponent('零時生存廣告合作洽詢')}&body=${encodeURIComponent('您好，我想了解零時生存（ZERO HOUR）的廣告版位合作方案，請問報價與詳細資訊？')}`
          }}
          className="inline-block px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 hover:text-white rounded-lg text-xs font-bold transition-colors"
        >
          📩 洽詢廣告合作
        </a>
      </motion.div>

      <p className="text-center text-gray-700 text-xs mt-6 leading-relaxed">
        這只是模擬情境。若您對災難應變感到焦慮，請聯絡專業資源。
      </p>

      {showAuthModal && (
        <AuthModal
          onSuccess={() => setShowAuthModal(false)}
          onClose={() => {
            setShowAuthModal(false)
            setPendingReport(false)
          }}
        />
      )}

      {showPaymentModal && (
        <PaymentModal onClose={() => setShowPaymentModal(false)} />
      )}
    </div>
  )
}
