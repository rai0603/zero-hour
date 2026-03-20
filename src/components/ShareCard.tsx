import { forwardRef } from 'react'
import { type ScenarioMeta, type QuestionHistory, type BonusEvent } from '../types'
import { getGradeInfo } from '../engine/scoreEngine'

const GRADE_COLOR: Record<string, string> = {
  S: '#eab308', A: '#22c55e', B: '#3b82f6', C: '#f97316', D: '#ef4444', F: '#6b7280',
}

interface ShareCardProps {
  score: number
  scenarioMeta: ScenarioMeta
  questionHistory: QuestionHistory[]
  bonusEvents: BonusEvent[]
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ score, scenarioMeta, questionHistory, bonusEvents }, ref) => {
    const { grade, roleTitle } = getGradeInfo(score)
    const color = GRADE_COLOR[grade] ?? '#fff'
    const optimalCount = questionHistory.filter(q => q.optionType === 'OPTIMAL').length
    const riskyCount = questionHistory.filter(q => q.optionType === 'RISKY').length
    const total = questionHistory.length
    const bonusTotal = bonusEvents.reduce((s, b) => s + b.points, 0)

    return (
      <div
        ref={ref}
        style={{
          width: '400px',
          height: '400px',
          background: 'linear-gradient(145deg, #0a0a0a 0%, #1a0505 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '-apple-system, "Microsoft JhengHei", "Noto Sans TC", sans-serif',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* 背景格線 */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.06,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 24px, #f97316 24px, #f97316 25px), repeating-linear-gradient(90deg, transparent, transparent 24px, #f97316 24px, #f97316 25px)',
        }} />

        {/* 頂部品牌 */}
        <div style={{
          position: 'absolute', top: 20, left: 0, right: 0,
          textAlign: 'center',
        }}>
          <p style={{ color: '#f97316', fontSize: '10px', fontWeight: 700, letterSpacing: '4px' }}>
            // 零時生存 ZERO HOUR
          </p>
        </div>

        {/* 評級大字 */}
        <div style={{
          width: '120px', height: '120px', borderRadius: '50%',
          border: `3px solid ${color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '12px',
          boxShadow: `0 0 40px ${color}40`,
        }}>
          <span style={{
            fontSize: '72px', fontWeight: 900, color,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
          }}>
            {grade}
          </span>
        </div>

        {/* 角色稱號 */}
        <p style={{ color: '#fff', fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
          {roleTitle}
        </p>

        {/* 分數 */}
        <p style={{ marginBottom: '20px' }}>
          <span style={{ color, fontSize: '28px', fontWeight: 900 }}>{score}</span>
          <span style={{ color: '#4b5563', fontSize: '14px' }}> / 500 分</span>
        </p>

        {/* 統計列 */}
        <div style={{
          display: 'flex', gap: '12px', marginBottom: '20px',
        }}>
          <div style={{
            background: '#052e16', border: '1px solid #166534',
            borderRadius: '8px', padding: '8px 14px', textAlign: 'center',
          }}>
            <p style={{ color: '#4ade80', fontSize: '20px', fontWeight: 900 }}>{optimalCount}</p>
            <p style={{ color: '#166534', fontSize: '10px' }}>最佳</p>
          </div>
          <div style={{
            background: '#1c1917', border: '1px solid #44403c',
            borderRadius: '8px', padding: '8px 14px', textAlign: 'center',
          }}>
            <p style={{ color: '#a8a29e', fontSize: '20px', fontWeight: 900 }}>{total}</p>
            <p style={{ color: '#44403c', fontSize: '10px' }}>題</p>
          </div>
          {riskyCount > 0 && (
            <div style={{
              background: '#450a0a', border: '1px solid #991b1b',
              borderRadius: '8px', padding: '8px 14px', textAlign: 'center',
            }}>
              <p style={{ color: '#f87171', fontSize: '20px', fontWeight: 900 }}>{riskyCount}</p>
              <p style={{ color: '#991b1b', fontSize: '10px' }}>高風險</p>
            </div>
          )}
          {bonusTotal > 0 && (
            <div style={{
              background: '#1c1400', border: '1px solid #854d0e',
              borderRadius: '8px', padding: '8px 14px', textAlign: 'center',
            }}>
              <p style={{ color: '#fbbf24', fontSize: '20px', fontWeight: 900 }}>+{bonusTotal}</p>
              <p style={{ color: '#854d0e', fontSize: '10px' }}>獎勵</p>
            </div>
          )}
        </div>

        {/* 情境標籤 */}
        <div style={{
          background: '#1a0505', border: '1px solid #f9731640',
          borderRadius: '6px', padding: '5px 14px',
        }}>
          <p style={{ color: '#f97316', fontSize: '11px', fontWeight: 600 }}>
            {scenarioMeta.id} {scenarioMeta.title}
          </p>
        </div>

        {/* 底部 */}
        <div style={{
          position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center',
        }}>
          <p style={{ color: '#374151', fontSize: '10px' }}>你的備災應變等級</p>
        </div>
      </div>
    )
  }
)

ShareCard.displayName = 'ShareCard'
export default ShareCard
