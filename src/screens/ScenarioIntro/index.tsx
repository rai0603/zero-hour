import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'

export default function ScenarioIntro() {
  const startScenario = useGameStore(s => s.startScenario)
  const scenarioMeta = useGameStore(s => s.scenarioMeta)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const lines = scenarioMeta.introText.split('\n').filter(Boolean)

  const scenarioImg = `/images/scenarios/${scenarioMeta.id.toLowerCase()}.jpg`

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* 情境背景圖 */}
      <div className="absolute inset-0">
        <img
          src={scenarioImg}
          alt=""
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/90" />
      </div>

      <div className="relative z-10 max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-orange-500 text-xs font-bold tracking-widest mb-4"
        >
          // 情境 {scenarioMeta.id}：{scenarioMeta.title}
        </motion.div>

        <div className="text-left space-y-3 mb-10">
          {lines.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={revealed ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.4, duration: 0.5 }}
              className="text-gray-300 text-base leading-relaxed"
            >
              {line}
            </motion.p>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: lines.length * 0.4 + 0.5 }}
          onClick={startScenario}
          whileTap={{ scale: 0.96 }}
          className="w-full py-4 bg-red-700 hover:bg-red-600 text-white font-bold text-lg tracking-widest rounded-lg transition-colors shadow-lg shadow-red-900/50"
        >
          開始應變 ⚡
        </motion.button>
      </div>
    </div>
  )
}
