import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { SCENARIO_LIST } from '../../data/scenarioLoader'

function DifficultyStars({ count }: { count: number }) {
  return (
    <span className="text-sm">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < count ? 'text-orange-400' : 'text-gray-700'}>
          ★
        </span>
      ))}
    </span>
  )
}

export default function ScenarioSelect() {
  const selectScenario = useGameStore(s => s.selectScenario)

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-start px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-orange-500 text-xs font-bold tracking-widest mb-2">// 選擇情境</p>
          <p className="text-gray-400 text-sm">選擇一個災害情境開始應變訓練</p>
        </div>

        {/* Scenario cards */}
        <div className="space-y-3">
          {SCENARIO_LIST.map((scenario, index) => {
            const isAvailable = scenario.available

            return (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.07, duration: 0.35 }}
              >
                {isAvailable ? (
                  <button
                    onClick={() => selectScenario(scenario.id)}
                    className="w-full text-left rounded-lg border border-orange-700/60 bg-gray-900 hover:border-orange-500 transition-all duration-200 group overflow-hidden"
                  >
                    {/* 情境圖片 */}
                    <div className="relative h-28 w-full overflow-hidden">
                      <img
                        src={`/images/scenarios/${scenario.id.toLowerCase()}.jpg`}
                        alt={scenario.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
                      <div className="absolute top-2 left-2">
                        <span className="text-orange-400 text-xs font-mono font-bold bg-black/50 px-1.5 py-0.5 rounded">
                          {scenario.id}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2">
                        <DifficultyStars count={scenario.difficulty} />
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-white font-bold text-base group-hover:text-orange-100 transition-colors mb-0.5">
                        {scenario.title}
                      </p>
                      <p className="text-gray-400 text-xs leading-relaxed">
                        {scenario.subtitle}
                      </p>
                    </div>
                  </button>
                ) : (
                  <div className="w-full text-left rounded-lg border border-gray-700/40 bg-gray-900/40 opacity-50 cursor-not-allowed overflow-hidden">
                    <div className="relative h-28 w-full overflow-hidden">
                      <img
                        src={`/images/scenarios/${scenario.id.toLowerCase()}.jpg`}
                        alt={scenario.title}
                        className="w-full h-full object-cover grayscale"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
                      <div className="absolute top-2 left-2">
                        <span className="text-gray-500 text-xs font-mono font-bold bg-black/50 px-1.5 py-0.5 rounded">
                          {scenario.id}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2 flex items-center gap-2">
                        <span className="text-xs bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded font-medium">即將開放</span>
                        <DifficultyStars count={scenario.difficulty} />
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-gray-400 font-bold text-base mb-0.5">{scenario.title}</p>
                      <p className="text-gray-600 text-xs leading-relaxed">{scenario.subtitle}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
