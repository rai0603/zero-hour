import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PaymentModalProps {
  onClose: () => void
}

export default function PaymentModal({ onClose }: PaymentModalProps) {
  const [showToast, setShowToast] = useState(false)

  function handlePay() {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
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
        <h2 className="text-white font-black text-2xl mb-1">解鎖完整分析報告</h2>
        <p className="text-gray-400 text-sm mb-5">NT$199・永久解鎖・所有情境報告</p>

        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 mb-6 space-y-3">
          {[
            { icon: '🔍', text: '逐題解析：每題選擇的詳細說明與知識點' },
            { icon: '📉', text: '個人弱點分析：找出你最需要加強的應變能力' },
            { icon: '🎒', text: '個人化備災清單：根據你的家庭狀況量身定製' },
            { icon: '📚', text: '學習資源推薦：延伸閱讀與訓練課程連結' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-start gap-3">
              <span className="text-lg leading-none mt-0.5">{icon}</span>
              <p className="text-gray-300 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <button
          onClick={handlePay}
          className="w-full py-4 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-black text-base tracking-wide rounded-xl transition-colors shadow-lg shadow-orange-900/40"
        >
          立即解鎖 NT$199
        </button>

        <p className="text-center text-gray-600 text-xs mt-3">安全付款・一次付費・永久有效</p>

        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-6 bottom-20 bg-gray-700 border border-gray-600 rounded-xl p-3 text-center text-white text-sm font-bold"
            >
              功能即將開放，敬請期待！
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
