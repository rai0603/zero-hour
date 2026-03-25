import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CHECKOUT_URL = 'https://iqai.lemonsqueezy.com/checkout/buy/4c725812-9809-4ed0-bf5b-70bb79884c9e'

interface PaymentModalProps {
  onClose: () => void
  onPdfUnlocked: () => void
  refetchProfile: () => void
  pdfUnlocked: boolean
}

export default function PaymentModal({ onClose, onPdfUnlocked, refetchProfile, pdfUnlocked }: PaymentModalProps) {
  const [checkingPurchase, setCheckingPurchase] = useState(false)

  function handleOpenCheckout() {
    window.open(CHECKOUT_URL, '_blank')
  }

  async function handleConfirmPurchase() {
    setCheckingPurchase(true)
    refetchProfile()
    // Give Supabase a moment to update after webhook fires
    await new Promise(r => setTimeout(r, 2000))
    setCheckingPurchase(false)
  }

  // Auto-close when unlocked
  if (pdfUnlocked) {
    onPdfUnlocked()
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="relative z-10 w-full max-w-md bg-gray-900 border border-orange-800/60 rounded-t-2xl sm:rounded-2xl p-6 mx-0 sm:mx-4"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 text-xl leading-none"
        >
          ×
        </button>

        <p className="text-orange-400 text-xs font-bold tracking-widest mb-2">// 進階功能</p>
        <h2 className="text-white font-black text-2xl mb-1">下載完整分析報告 PDF</h2>
        <p className="text-gray-400 text-sm mb-5">NT$99・一次付費・永久有效</p>

        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 mb-6 space-y-3">
          {[
            { icon: '🔍', text: '逐題解析：每題選擇的詳細說明與知識點' },
            { icon: '📊', text: '完整統計：各類型選擇數量與得分明細' },
            { icon: '🎒', text: '個人檔案對照：依你的環境與背景分析' },
            { icon: '📄', text: 'PDF 格式：可儲存、列印、與朋友分享' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-start gap-3">
              <span className="text-lg leading-none mt-0.5">{icon}</span>
              <p className="text-gray-300 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <button
          onClick={handleOpenCheckout}
          className="w-full py-4 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-black text-base tracking-wide rounded-xl transition-colors shadow-lg shadow-orange-900/40 mb-3"
        >
          前往付款 NT$99
        </button>

        <button
          onClick={handleConfirmPurchase}
          disabled={checkingPurchase}
          className="w-full py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
        >
          {checkingPurchase ? '確認中…' : '我已完成付款，確認解鎖'}
        </button>

        <p className="text-center text-gray-600 text-xs mt-3">安全付款・付款後點「確認解鎖」</p>

        <AnimatePresence>
          {checkingPurchase && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-6 bottom-20 bg-gray-700 border border-gray-600 rounded-xl p-3 text-center text-white text-sm font-bold"
            >
              確認付款狀態中…
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
