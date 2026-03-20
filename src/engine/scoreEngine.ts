import { type GameState, type BonusEvent, type Grade, type GradeInfo } from '../types'

export function calcScore(
  type: string,
  baseScore: number,
  timedOut: boolean,
  timedIn: boolean
): number {
  let score = baseScore
  if (type === 'SUBOPTIMAL') score -= 2
  if (type === 'RISKY') score -= 5
  if (timedOut) score -= 3
  if (timedIn && !timedOut) score += 5
  return Math.max(0, score)
}

export function calcBonuses(state: GameState): BonusEvent[] {
  const bonuses: BonusEvent[] = []

  if (state.consecutiveOptimal >= 5) {
    bonuses.push({ label: '連續 5 題最佳解', points: 20 })
  }
  if (state.helpedNPC) {
    bonuses.push({ label: '成功協助他人', points: 15 })
  }
  if (state.companionsAlive.length > 0 &&
    state.profile?.companions.every(c => state.companionsAlive.includes(c))) {
    bonuses.push({ label: '保全所有同行人員', points: 25 })
  }
  if (!state.hasRisky) {
    bonuses.push({ label: '全程無高風險選擇', points: 30 })
  }

  return bonuses
}

export function calcFinalScore(state: GameState): number {
  const bonuses = calcBonuses(state)
  const bonusTotal = bonuses.reduce((sum, b) => sum + b.points, 0)
  return Math.min(500, state.score + bonusTotal)
}

export function getGrade(score: number): Grade {
  if (score >= 450) return 'S'
  if (score >= 380) return 'A'
  if (score >= 280) return 'B'
  if (score >= 180) return 'C'
  if (score >= 80) return 'D'
  return 'F'
}

const gradeData: Record<Grade, Omit<GradeInfo, 'grade'>> = {
  S: {
    roleTitle: '生存專家・守護者',
    description: '您展現了高度的危機意識與正確的應變知識，在極端狀況下仍能冷靜做出最佳判斷。您是家人和社區最可靠的支柱。',
  },
  A: {
    roleTitle: '冷靜應變者',
    description: '您的應變能力高於平均水準，在多數情境下能做出正確判斷，偶爾的猶豫未造成嚴重後果。稍加補強知識即可達到最高水準。',
  },
  B: {
    roleTitle: '普通倖存者',
    description: '您具備基本的求生本能，但在關鍵決策點上有一些誤判。建議加強防災知識，特別是您的弱項領域。',
  },
  C: {
    roleTitle: '高風險倖存者',
    description: '您靠運氣撐過了一些危機，但多次做出高風險選擇。若在真實情境中可能面臨嚴重後果。強烈建議參加防災課程。',
  },
  D: {
    roleTitle: '脆弱的倖存者',
    description: '您在本次測試中遭遇了多次嚴重困境，主要靠外部因素倖存。您迫切需要系統性的防災知識學習。',
  },
  F: {
    roleTitle: '未準備的遇難者',
    description: '此次結果顯示您目前面對災難的應變準備相當不足。請立即著手了解基本防災知識與規劃家庭緊急應對方案。',
  },
}

export function getGradeInfo(score: number): GradeInfo {
  const grade = getGrade(score)
  return { grade, ...gradeData[grade] }
}
