import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { type FailureType } from '../../types'

const failureContent: Record<FailureType, { title: string; desc: string; tip: string }> = {
  DEATH: {
    title: '任務失敗：生命終止',
    desc: '你做出了一個無法挽回的選擇，在這場災難中失去了生命。',
    tip: '⚡ 知識點：在緊急狀況下，保持冷靜比衝動行動更重要。',
  },
  INJURY: {
    title: '任務失敗：傷勢過重',
    desc: '你因傷勢過重，無法繼續行動，需要他人的救援。',
    tip: '⚡ 知識點：多次高風險選擇會累積傷害，影響後續行動能力。',
  },
  CAPTURED: {
    title: '任務失敗：被敵方俘虜',
    desc: '你被對方俘虜，任務宣告失敗。',
    tip: '⚡ 知識點：在衝突情境中，了解局勢後再行動比貿然前進更安全。',
  },
  INFECTED: {
    title: '任務失敗：確診感染',
    desc: '你已確診，需要強制隔離，家人陷入困境。',
    tip: '⚡ 知識點：疫情期間個人防護措施的每個細節都可能影響全家人的安全。',
  },
  RESOURCE_DEPLETED: {
    title: '任務失敗：資源耗盡',
    desc: '你的食物和飲水告罄，無法繼續生存。',
    tip: '⚡ 知識點：平時備有 72 小時緊急包，能在災難初期大幅提升存活率。',
  },
  MENTAL_COLLAPSE: {
    title: '任務失敗：心理崩潰',
    desc: '長期壓力累積，你的心理狀態已無法支撐繼續做出判斷。',
    tip: '⚡ 知識點：長期災難中的心理健康管理和社群互助同樣重要。',
  },
}

export default function GameOverScreen() {
  const failureType = useGameStore(s => s.failureType)
  const score = useGameStore(s => s.score)
  const restartScenario = useGameStore(s => s.restartScenario)
  const fullReset = useGameStore(s => s.fullReset)

  const content = failureContent[failureType ?? 'DEATH']

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="text-7xl mb-6"
        >
          💀
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-red-500 font-black text-2xl mb-2"
        >
          {content.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-400 text-sm mb-6 leading-relaxed"
        >
          {content.desc}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-8 text-left"
        >
          <p className="text-orange-300 text-sm leading-relaxed">{content.tip}</p>
          <p className="text-gray-600 text-xs mt-2">本次得分：{score} 分</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="space-y-3"
        >
          <button
            onClick={restartScenario}
            className="w-full py-4 bg-orange-700 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors"
          >
            重新挑戰（-10分懲罰）
          </button>
          <button
            onClick={fullReset}
            className="w-full py-3 bg-transparent border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-gray-200 font-medium rounded-lg transition-colors text-sm"
          >
            更換人物設定，重新開始
          </button>
        </motion.div>
      </div>
    </div>
  )
}
