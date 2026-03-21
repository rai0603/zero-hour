import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { profileQuestions } from '../../data/profileQuestions'
import { type PlayerProfile } from '../../types'

function getLabel(fieldId: keyof PlayerProfile, value: string | string[]): string {
  const q = profileQuestions.find(p => p.id === fieldId)
  if (!q) return String(value)
  if (Array.isArray(value)) {
    return value.map(v => q.options.find(o => o.value === v)?.label ?? v).join('、')
  }
  return q.options.find(o => o.value === value)?.label ?? value
}

const rows: { id: keyof PlayerProfile; icon: string; label: string }[] = [
  { id: 'gender',              icon: '👤', label: '性別' },
  { id: 'ageGroup',            icon: '📅', label: '年齡層' },
  { id: 'location',            icon: '📍', label: '居住環境' },
  { id: 'companions',          icon: '👥', label: '同住人員' },
  { id: 'vehicles',            icon: '🚗', label: '交通工具' },
  { id: 'supplies',            icon: '🎒', label: '家中物資' },
  { id: 'healthStatus',        icon: '❤️', label: '健康狀況' },
  { id: 'occupation',          icon: '💼', label: '職業類別' },
  { id: 'selfRatedKnowledge',  icon: '🧠', label: '應變知識' },
]

export default function ProfileCard() {
  const profile = useGameStore(s => s.profile)
  const confirmProfile = useGameStore(s => s.confirmProfile)

  if (!profile) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-950 flex flex-col px-4 py-6 max-w-lg mx-auto"
    >
      <p className="text-orange-500 text-xs font-bold tracking-widest mb-1">// 人物側寫確認</p>
      <h2 className="text-white font-bold text-xl mb-1">你的基本狀態</h2>
      <p className="text-gray-500 text-xs mb-6">以下資料將影響部分情境選項與應變結果</p>

      <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800 mb-6">
        {rows.map(({ id, icon, label }) => {
          const val = profile[id]
          const display = getLabel(id, val)
          return (
            <div key={id} className="flex items-start gap-3 px-4 py-3">
              <span className="text-base mt-0.5 shrink-0">{icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-gray-500 text-xs mb-0.5">{label}</p>
                <p className="text-gray-200 text-sm leading-snug break-words">{display}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-auto">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={confirmProfile}
          className="w-full py-4 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-bold text-base rounded-xl transition-colors"
        >
          確認，選擇情境 ▶
        </motion.button>
      </div>
    </motion.div>
  )
}
