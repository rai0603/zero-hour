import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { getGradeInfo } from '../engine/scoreEngine'
import { allScenarios } from '../data/scenarioLoader'
import { generateReport } from '../utils/generateReport'

const TYPE_LABEL: Record<string, string> = {
  OPTIMAL: '最佳選擇', SUBOPTIMAL: '次佳選擇', RISKY: '高風險', FATAL: '致命選擇', DYNAMIC: '動態結果',
}
const TYPE_COLOR: Record<string, string> = {
  OPTIMAL: 'text-green-400 border-green-500 bg-green-950/30',
  SUBOPTIMAL: 'text-amber-400 border-amber-500 bg-amber-950/30',
  RISKY: 'text-red-400 border-red-500 bg-red-950/30',
  FATAL: 'text-red-300 border-red-800 bg-red-950/50',
  DYNAMIC: 'text-indigo-400 border-indigo-500 bg-indigo-950/30',
}
const PROFILE_LABELS: Record<string, Record<string, string>> = {
  gender: { male: '男性', female: '女性', other: '不願透露' },
  ageGroup: { under18: '18 歲以下', '18-35': '18～35 歲', '36-55': '36～55 歲', over56: '56 歲以上' },
  location: { urban: '都市', suburban: '郊區', rural: '鄉村', mountain: '山區', coastal: '海岸', island: '離島' },
  healthStatus: { healthy: '健康', chronic: '輕度慢性病', mobility: '行動不便', pregnant: '懷孕中' },
  selfRatedKnowledge: { none: '完全不了解', basic: '略有耳聞', drill: '曾參與演習', trained: '系統學習過' },
  occupation: { general: '上班族/學生', medical: '醫療護理', military: '軍警消防', agriculture: '農漁牧業', service: '服務業', other: '其他' },
}
function labelVal(cat: string, val: string) { return PROFILE_LABELS[cat]?.[val] ?? val }
function labelArr(cat: string, vals: string[]) { return vals.map(v => labelVal(cat, v)).join('、') }

const gradeColors: Record<string, string> = {
  S: 'text-yellow-400', A: 'text-green-400', B: 'text-blue-400',
  C: 'text-orange-400', D: 'text-red-400', F: 'text-gray-500',
}

export default function ReportOverlay({ onClose }: { onClose: () => void }) {
  const score = useGameStore(s => s.score)
  const bonusEvents = useGameStore(s => s.bonusEvents)
  const questionHistory = useGameStore(s => s.questionHistory)
  const scenarioMeta = useGameStore(s => s.scenarioMeta)
  const selectedScenarioId = useGameStore(s => s.selectedScenarioId)
  const profile = useGameStore(s => s.profile)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { grade, roleTitle, description } = getGradeInfo(score)
  const scenario = selectedScenarioId ? allScenarios[selectedScenarioId] : null

  const optimalCount = questionHistory.filter(q => q.optionType === 'OPTIMAL').length
  const suboptimalCount = questionHistory.filter(q => q.optionType === 'SUBOPTIMAL').length
  const riskyCount = questionHistory.filter(q => q.optionType === 'RISKY').length

  function handleDownloadPDF() {
    if (!selectedScenarioId) return
    // TODO: 恢復付費牆（ECPay 串接後）
    generateReport({ score, questionHistory, bonusEvents, scenarioMeta, selectedScenarioId, profile })
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gray-950 flex flex-col"
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-950">
          <p className="text-orange-500 text-xs font-bold tracking-widest">// 完整分析報告</p>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-sm font-bold px-3 py-1 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors">
            關閉 ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 max-w-lg mx-auto w-full">

          {/* Grade */}
          <div className="text-center mb-8">
            <div className={`text-8xl font-black mb-2 ${gradeColors[grade] ?? 'text-white'}`}>{grade}</div>
            <p className="text-white font-bold text-lg mb-0.5">{roleTitle}</p>
            <p className="text-gray-400 text-xl font-bold">{score} <span className="text-sm text-gray-600">/ 500 分</span></p>
            <p className="text-gray-600 text-xs mt-1">{scenarioMeta.title}・{scenarioMeta.subtitle}</p>
          </div>

          {/* Description */}
          <Section title="整體評語">
            <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
          </Section>

          {/* Stats */}
          <Section title="答題統計">
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="最佳選擇" value={optimalCount} color="text-green-400" bg="bg-green-950/30 border-green-900/50" />
              <StatCard label="次佳選擇" value={suboptimalCount} color="text-amber-400" bg="bg-amber-950/30 border-amber-900/50" />
              <StatCard label="高風險" value={riskyCount} color="text-red-400" bg="bg-red-950/30 border-red-900/50" />
            </div>
          </Section>

          {/* Bonuses */}
          {bonusEvents.length > 0 && (
            <Section title="額外獎勵">
              {bonusEvents.map((b, i) => (
                <div key={i} className="flex justify-between text-sm py-2 border-b border-gray-800 last:border-0">
                  <span className="text-gray-300">{b.label}</span>
                  <span className="text-green-400 font-bold">+{b.points}</span>
                </div>
              ))}
            </Section>
          )}

          {/* Profile */}
          {profile && (
            <Section title="個人檔案">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  ['性別', labelVal('gender', profile.gender)],
                  ['年齡', labelVal('ageGroup', profile.ageGroup)],
                  ['居住地', labelVal('location', profile.location)],
                  ['職業', labelVal('occupation', profile.occupation)],
                  ['健康', labelVal('healthStatus', profile.healthStatus)],
                  ['防災知識', labelVal('selfRatedKnowledge', profile.selfRatedKnowledge)],
                  ...(profile.companions.length > 0 ? [['同行人員', labelArr('companions', profile.companions)]] : []),
                  ...(profile.vehicles.length > 0 ? [['交通工具', labelArr('vehicles', profile.vehicles)]] : []),
                  ...(profile.supplies.length > 0 ? [['現有物資', labelArr('supplies', profile.supplies)]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="text-xs py-1.5 border-b border-gray-800/60">
                    <span className="text-gray-500">{k}　</span>
                    <span className="text-gray-300">{v}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Question breakdown */}
          <Section title="逐題解析">
            <div className="space-y-4">
              {questionHistory.map((h, i) => {
                const q = scenario?.questions[h.questionId]
                if (!q) return null
                const chosen = q.options.find(o => o.id === h.selectedOptionId)
                const colorClass = TYPE_COLOR[h.optionType] ?? 'text-gray-400 border-gray-600 bg-gray-900'
                return (
                  <div key={h.questionId} className="border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-gray-800 text-gray-300 text-xs font-bold px-2 py-0.5 rounded">Q{i + 1}</span>
                      <span className="text-gray-500 text-xs flex-1">{q.phaseName}</span>
                      <span className="text-green-400 text-xs font-bold">+{h.scoreEarned} 分</span>
                    </div>
                    <p className="text-gray-400 text-xs mb-1 leading-relaxed">{q.situationText}</p>
                    <p className="text-gray-200 text-sm font-bold mb-3 leading-snug">{q.questionText}</p>
                    {chosen && (
                      <div className={`border-l-2 pl-3 rounded-r-lg p-2 ${colorClass}`}>
                        <span className="text-xs font-bold">你的選擇・{TYPE_LABEL[h.optionType]}</span>
                        <p className="text-gray-200 text-sm mt-1">{chosen.text}</p>
                        {chosen.consequenceText && (
                          <p className="text-gray-400 text-xs mt-2 bg-gray-800/50 rounded p-2">📌 {chosen.consequenceText}</p>
                        )}
                        {chosen.knowledge && (
                          <p className="text-blue-300 text-xs mt-2 bg-blue-950/30 rounded p-2">💡 {chosen.knowledge}</p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Section>

          {/* Download PDF (paid) */}
          <div className="mt-8 mb-4">
            <button
              onClick={handleDownloadPDF}
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-sm transition-colors"
            >
              📄 下載完整報告 PDF（付費解鎖）
            </button>
            <p className="text-gray-600 text-xs text-center mt-2">下載 PDF 版本需付費解鎖，報告內容與上方相同</p>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-orange-500 text-xs font-bold tracking-widest mb-3">// {title}</p>
      {children}
    </div>
  )
}

function StatCard({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <div className={`border rounded-xl p-3 text-center ${bg}`}>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      <p className="text-gray-500 text-xs mt-0.5">{label}</p>
    </div>
  )
}
