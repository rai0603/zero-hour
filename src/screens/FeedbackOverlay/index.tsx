import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'

const config = {
  OPTIMAL: {
    bg: 'bg-green-950',
    border: 'border-green-700',
    icon: '✅',
    label: '最佳選擇',
    labelColor: 'text-green-400',
    delay: 3000,
  },
  SUBOPTIMAL: {
    bg: 'bg-yellow-950',
    border: 'border-yellow-700',
    icon: '⚠️',
    label: '次佳選擇',
    labelColor: 'text-yellow-400',
    delay: 3000,
  },
  RISKY: {
    bg: 'bg-red-950',
    border: 'border-red-800',
    icon: '🔴',
    label: '高風險選擇',
    labelColor: 'text-red-400',
    delay: 3500,
  },
  FATAL: {
    bg: 'bg-black',
    border: 'border-gray-900',
    icon: '💀',
    label: '致命選擇',
    labelColor: 'text-red-600',
    delay: 4000,
  },
  DYNAMIC: {
    bg: 'bg-gray-950',
    border: 'border-gray-700',
    icon: '🔄',
    label: '特殊選擇',
    labelColor: 'text-gray-400',
    delay: 3000,
  },
}

export default function FeedbackOverlay() {
  const lastChosenOption = useGameStore(s => s.lastChosenOption)
  const advanceQuestion = useGameStore(s => s.advanceQuestion)

  const option = lastChosenOption
  const cfg = config[option?.type ?? 'OPTIMAL']

  if (!option) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 ${cfg.bg} flex flex-col items-center justify-center px-6 z-50`}
    >
      <div className={`max-w-md w-full border ${cfg.border} rounded-xl p-6 text-center`}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="text-5xl mb-4"
        >
          {cfg.icon}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`text-xs font-bold tracking-widest mb-3 ${cfg.labelColor}`}
        >
          {cfg.label}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-200 text-sm leading-relaxed"
        >
          {option.consequenceText}
        </motion.p>

        {option.knowledge && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-4 bg-blue-950/50 border border-blue-800/40 rounded-lg px-4 py-3 text-left"
          >
            <p className="text-blue-400 text-xs font-bold tracking-wide mb-1">💡 知識補充</p>
            <p className="text-blue-100 text-xs leading-relaxed">{option.knowledge}</p>
          </motion.div>
        )}

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={advanceQuestion}
          className="mt-6 w-full py-3 rounded-lg bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-gray-200 text-sm font-bold transition-colors"
        >
          繼續 →
        </motion.button>
      </div>
    </motion.div>
  )
}
