import { useState, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { profileQuestions } from '../../data/profileQuestions'
import { type PlayerProfile } from '../../types'

const ProfileOptionButton = memo(function ProfileOptionButton({
  questionId,
  value,
  label,
  selected,
  onToggle,
}: {
  questionId: string
  value: string
  label: string
  selected: boolean
  onToggle: (v: string) => void
}) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const imgPath = `/images/profile/${questionId}_${value}.jpg`

  return (
    <button
      onClick={() => onToggle(value)}
      className={`w-full text-left rounded-lg border overflow-hidden transition-all ${
        selected
          ? 'bg-orange-600/20 border-orange-500'
          : 'bg-gray-900 border-gray-800 hover:border-gray-600'
      }`}
    >
      <div className="flex items-stretch min-h-[64px]">
        {/* 左側圖片欄 */}
        <div className="relative w-16 shrink-0 bg-gray-800">
          <img
            src={imgPath}
            alt=""
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgLoaded(false)}
            className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
          {/* 選中標記 */}
          {selected && (
            <div className="absolute inset-0 flex items-center justify-center bg-orange-600/40">
              <span className="text-white text-lg font-black">✓</span>
            </div>
          )}
        </div>

        {/* 右側文字 */}
        <div className="flex-1 px-3 flex items-center">
          <p className={`text-sm leading-snug ${selected ? 'text-white font-medium' : 'text-gray-300'}`}>
            {selected ? '▶ ' : ''}{label}
          </p>
        </div>
      </div>
    </button>
  )
})

const defaultProfile: PlayerProfile = {
  gender: '',
  ageGroup: '',
  location: '',
  companions: [],
  vehicles: [],
  supplies: [],
  healthStatus: '',
  occupation: '',
  selfRatedKnowledge: '',
}

function randomProfile(): PlayerProfile {
  function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
  }
  function pickMulti<T>(arr: T[]): T[] {
    const count = Math.floor(Math.random() * Math.min(3, arr.length)) + 1
    const shuffled = [...arr].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  const q = profileQuestions
  return {
    gender: pick(q.find(p => p.id === 'gender')!.options).value,
    ageGroup: pick(q.find(p => p.id === 'ageGroup')!.options).value,
    location: pick(q.find(p => p.id === 'location')!.options).value,
    companions: pickMulti(q.find(p => p.id === 'companions')!.options).map(o => o.value),
    vehicles: pickMulti(q.find(p => p.id === 'vehicles')!.options).map(o => o.value),
    supplies: pickMulti(q.find(p => p.id === 'supplies')!.options).map(o => o.value),
    healthStatus: pick(q.find(p => p.id === 'healthStatus')!.options).value,
    occupation: pick(q.find(p => p.id === 'occupation')!.options).value,
    selfRatedKnowledge: pick(q.find(p => p.id === 'selfRatedKnowledge')!.options).value,
  }
}

export default function ProfileSurvey() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<PlayerProfile>({ ...defaultProfile })
  const setProfile = useGameStore(s => s.setProfile)

  function handleRandom() {
    const profile = randomProfile()
    setProfile(profile)
  }

  const current = profileQuestions[step]
  const isLast = step === profileQuestions.length - 1

  function isAnswered() {
    const val = answers[current.id]
    if (current.multiSelect) return (val as string[]).length > 0
    return !!val
  }

  function toggleOption(value: string) {
    if (current.multiSelect) {
      const arr = (answers[current.id] as string[]) || []
      const next = arr.includes(value)
        ? arr.filter(v => v !== value)
        : [...arr, value]
      setAnswers(prev => ({ ...prev, [current.id]: next }))
    } else {
      setAnswers(prev => ({ ...prev, [current.id]: value }))
    }
  }

  function isSelected(value: string) {
    const val = answers[current.id]
    if (current.multiSelect) return (val as string[])?.includes(value)
    return val === value
  }

  function handleNext() {
    if (!isAnswered()) return
    if (isLast) {
      setProfile(answers)
    } else {
      setStep(s => s + 1)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <p className="text-orange-500 text-xs font-bold tracking-widest">// 人物側寫</p>
          {step === 0 && (
            <button
              onClick={handleRandom}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-xs font-bold transition-colors"
            >
              🎲 隨機生成角色
            </button>
          )}
        </div>
        <div className="flex gap-1 mb-4">
          {profileQuestions.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-orange-500' : 'bg-gray-800'}`}
            />
          ))}
        </div>
        <p className="text-gray-500 text-xs">{step + 1} / {profileQuestions.length}</p>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="flex-1"
        >
          <h2 className="text-white font-bold text-lg mb-6 leading-snug">
            {current.question}
          </h2>

          {current.multiSelect && (
            <p className="text-gray-500 text-xs mb-3">可複選</p>
          )}

          <div className="space-y-2">
            {current.options.map(opt => (
              <ProfileOptionButton
                key={opt.value}
                questionId={current.id}
                value={opt.value}
                label={opt.label}
                selected={isSelected(opt.value)}
                onToggle={toggleOption}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Next Button */}
      <div className="mt-8">
        <button
          onClick={handleNext}
          disabled={!isAnswered()}
          className={`w-full py-4 rounded-lg font-bold text-base transition-all ${
            isAnswered()
              ? 'bg-orange-600 hover:bg-orange-500 text-white'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          }`}
        >
          {isLast ? '完成，進入情境 ▶' : '下一題 →'}
        </button>
      </div>
    </div>
  )
}
