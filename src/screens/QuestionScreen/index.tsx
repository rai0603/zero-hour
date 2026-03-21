import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { allScenarios } from '../../data/scenarioLoader'
import { type Option } from '../../types'

function HUD({ score, riskLevel, resourceLevel, phaseName, timerNode }: {
  score: number
  riskLevel: number
  resourceLevel: number
  phaseName: string
  timerNode?: React.ReactNode
}) {
  return (
    <div className="bg-gray-950 border-b border-gray-800 px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-orange-400 text-xs font-bold tracking-wide">
          {phaseName}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-white font-bold text-sm">{score} 分</span>
          {timerNode}
        </div>
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <p className="text-gray-500 text-xs mb-1">危險</p>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full transition-all"
              style={{ width: `${(riskLevel / 3) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-gray-500 text-xs mb-1">物資</p>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${resourceLevel}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function CountdownTimer({ timeLimit, onTimeout }: { timeLimit: number; onTimeout: () => void }) {
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const calledRef = useRef(false)

  useEffect(() => {
    calledRef.current = false
    setTimeLeft(timeLimit)
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          if (!calledRef.current) {
            calledRef.current = true
            setTimeout(onTimeout, 0)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [timeLimit, onTimeout])

  const pct = (timeLeft / timeLimit) * 100
  const urgent = timeLeft <= 10

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-8 h-8">
        <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="12" fill="none" stroke="#1f2937" strokeWidth="3" />
          <circle
            cx="16" cy="16" r="12" fill="none"
            stroke={urgent ? '#ef4444' : '#f97316'}
            strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 12}`}
            strokeDashoffset={`${2 * Math.PI * 12 * (1 - pct / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${urgent ? 'text-red-400 animate-pulse' : 'text-white'}`}>
          {timeLeft}
        </span>
      </div>
    </div>
  )
}

const labels = ['A', 'B', 'C', 'D']

export default function QuestionScreen() {
  const currentQuestionId = useGameStore(s => s.currentQuestionId)
  const currentOptions = useGameStore(s => s.currentOptions)
  const score = useGameStore(s => s.score)
  const riskLevel = useGameStore(s => s.riskLevel)
  const resourceLevel = useGameStore(s => s.resourceLevel)
  const selectOption = useGameStore(s => s.selectOption)
  const selectedScenarioId = useGameStore(s => s.selectedScenarioId)

  const [selected, setSelected] = useState<string | null>(null)
  const question = selectedScenarioId
    ? allScenarios[selectedScenarioId]?.questions[currentQuestionId]
    : undefined

  useEffect(() => {
    setSelected(null)
  }, [currentQuestionId])

  function handleSelect(option: Option) {
    if (selected) return
    setSelected(option.id)
    setTimeout(() => selectOption(option), 300)
  }

  function handleTimeout() {
    if (selected || !currentOptions.length) return
    // Select the worst non-FATAL option automatically
    const worst = currentOptions.find(o => o.type === 'RISKY') ??
      currentOptions.find(o => o.type === 'SUBOPTIMAL') ??
      currentOptions[currentOptions.length - 1]
    setSelected(worst.id)
    setTimeout(() => selectOption(worst), 300)
  }

  if (!question) return null

  const timerNode = question.timeLimit ? (
    <CountdownTimer
      key={currentQuestionId}
      timeLimit={question.timeLimit}
      onTimeout={handleTimeout}
    />
  ) : undefined

  return (
    <div className="h-[100dvh] bg-gray-950 flex flex-col">
      <HUD score={score} riskLevel={riskLevel} resourceLevel={resourceLevel} phaseName={question.phaseName} timerNode={timerNode} />

      <div className="flex-1 flex flex-col px-4 py-5 max-w-lg mx-auto w-full overflow-y-auto" style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}>
        {/* Situation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            {/* 情境圖片 */}
            {selectedScenarioId && (() => {
              const imgPath = `/images/${selectedScenarioId.toLowerCase()}/${question.id}.jpg`
              return (
                <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4 bg-gray-900">
                  <img
                    src={imgPath}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-950/70 to-transparent" />
                </div>
              )
            })()}

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-4">
              <p className="text-gray-300 text-sm leading-relaxed">{question.situationText}</p>
            </div>

            <div className="bg-orange-950/30 border border-orange-900/50 rounded-lg px-4 py-3 mb-5">
              <p className="text-orange-200 font-bold text-base">❓ {question.questionText}</p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentOptions.map((option, i) => {
                const label = labels[i] ?? String(i + 1)
                const isChosen = selected === option.id
                return (
                  <motion.button
                    key={option.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(option)}
                    disabled={!!selected}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all text-sm
                      ${isChosen ? 'bg-orange-700/30 border-orange-500 text-white' : 'bg-gray-900 border-gray-700 hover:border-orange-600 text-gray-300'}
                      ${selected && !isChosen ? 'opacity-40' : ''}
                    `}
                  >
                    <span className="text-orange-400 font-bold mr-2">[{label}]</span>
                    {option.text}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
