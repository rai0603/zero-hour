import type { Question, Option, OptionType, ScenarioMeta } from '../types'

import s1Json from './json/s1_earthquake.json'
import s2Json from './json/s2_tsunami.json'
import s3Json from './json/s3_war.json'
import s4Json from './json/s4_typhoon.json'
import s5Json from './json/s5_terror.json'
import s6Json from './json/s6_pandemic.json'
import s7Json from './json/s7_unknown.json'

export interface ScenarioData {
  meta: ScenarioMeta
  questions: Record<string, Question>
  firstQuestionId: string
  endings: Record<string, { type: string; title: string; description: string }>
}

function normalizeNextQuestionId(id: string): string {
  if (id === 'GAME_OVER') return 'GAME_OVER'
  // Any ending that is _COMPLETE, _COMPLETE_B, _COMPLETE_C, etc.
  if (/_COMPLETE/.test(id)) return 'SCENARIO_COMPLETE'
  return id
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadScenario(jsonData: any): ScenarioData {
  const scenario = jsonData.scenario
  const jsonQuestions: any[] = jsonData.questions
  const endings: Record<string, { type: string; title: string; description: string }> =
    jsonData.endings ?? {}

  const meta: ScenarioMeta = {
    id: scenario.id,
    title: scenario.title,
    subtitle: scenario.subtitle,
    introText: scenario.setting ?? '',
    difficulty: scenario.difficulty ?? 3,
    phaseNames: scenario.phases ?? [],
  }

  const questions: Record<string, Question> = {}

  for (const jq of jsonQuestions) {
    const questionId: string = jq.id

    const options: Option[] = (jq.options ?? []).map((o: any) => {
      const optionId = `${questionId}_${o.id}`
      return {
        id: optionId,
        text: o.text,
        type: (o.type as OptionType) ?? 'SUBOPTIMAL',
        scoreDelta: o.score_delta ?? 0,
        nextQuestionId: normalizeNextQuestionId(o.next_question_id ?? 'GAME_OVER'),
        consequenceText: o.consequence ?? '',
        knowledge: o.knowledge ?? '',
        profileRequired: undefined,
      } satisfies Option
    })

    const question: Question = {
      id: questionId,
      scenarioId: scenario.id,
      phase: jq.phase ?? 1,
      phaseName: jq.phase_name ?? '',
      situationText: jq.situation ?? '',
      questionText: jq.question ?? '',
      options,
      timeLimit: jq.time_limit_seconds ?? undefined,
      knowledgeTags: [],
    }

    questions[questionId] = question
  }

  const firstQuestionId = jsonQuestions[0]?.id ?? ''

  return { meta, questions, firstQuestionId, endings }
}

export const allScenarios: Record<string, ScenarioData> = {
  S1: loadScenario(s1Json),
  S2: loadScenario(s2Json),
  S3: loadScenario(s3Json),
  S4: loadScenario(s4Json),
  S5: loadScenario(s5Json),
  S6: loadScenario(s6Json),
  S7: loadScenario(s7Json),
}

export const SCENARIO_LIST = [
  { id: 'S1', title: '大地震', subtitle: '規模7.2・都市直下型・黃金72小時', difficulty: 3, available: true },
  { id: 'S2', title: '海嘯警報', subtitle: '15分鐘・東部外海地震・垂直撤離', difficulty: 4, available: true },
  { id: 'S3', title: '戰爭衝突', subtitle: '台海緊張升溫・飛彈預警・城市戒嚴', difficulty: 5, available: true },
  { id: 'S4', title: '異常天候', subtitle: '超強颱風直撲台灣・複合式洪水土石流', difficulty: 3, available: true },
  { id: 'S5', title: '恐怖攻擊', subtitle: '捷運/百貨公司/公共場所爆炸或挾持', difficulty: 4, available: true },
  { id: 'S6', title: '疫情感染', subtitle: '不明病毒爆發・城市封鎖・物資短缺', difficulty: 3, available: true },
  { id: 'S7', title: '不明生物攻擊', subtitle: '山區/海域不明生物出沒・都市大規模動物異常', difficulty: 4, available: true },
]
