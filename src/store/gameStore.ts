import { create } from 'zustand'
import { type GameState, type PlayerProfile, type Option, type Screen, type QuestionHistory, type BonusEvent, type ScenarioMeta } from '../types'
import { allScenarios } from '../data/scenarioLoader'
import { filterOptionsByProfile } from '../engine/profileFilter'
import { calcScore, calcBonuses, getGrade } from '../engine/scoreEngine'
import { supabase } from '../lib/supabase'

interface GameStore extends GameState {
  screen: Screen
  selectedScenarioId: string | null
  currentOptions: Option[]
  lastChosenOption: Option | null
  bonusEvents: BonusEvent[]
  scenarioMeta: ScenarioMeta

  resultSaved: boolean
  saveError: string | null

  startGame: () => void
  setProfile: (profile: PlayerProfile) => void
  confirmProfile: () => void
  selectScenario: (scenarioId: string) => void
  startScenario: () => void
  selectOption: (option: Option) => void
  advanceQuestion: () => void
  restartScenario: () => void
  fullReset: () => void
  saveResult: (userId: string, meta?: { displayName?: string; country?: string; avatarUrl?: string }) => Promise<void>
  goToWishPool: () => void
  goToAccount: () => void
  goToStart: () => void
}

const defaultMeta: ScenarioMeta = {
  id: '',
  title: '',
  subtitle: '',
  introText: '',
  difficulty: 1,
  phaseNames: [],
}

const initialState: Omit<GameStore, 'startGame' | 'setProfile' | 'confirmProfile' | 'selectScenario' | 'startScenario' | 'selectOption' | 'advanceQuestion' | 'restartScenario' | 'fullReset' | 'saveResult' | 'goToWishPool' | 'goToAccount' | 'goToStart'> = {
  screen: 'start',
  selectedScenarioId: null,
  sessionId: crypto.randomUUID(),
  profile: null,
  scenarioId: '',
  currentQuestionId: '',
  questionHistory: [],
  score: 0,
  riskLevel: 0,
  injuryLevel: 0,
  companionsAlive: [],
  resourceLevel: 100,
  gameStatus: 'playing',
  failureType: undefined,
  startTime: null,
  endTime: null,
  consecutiveOptimal: 0,
  bonusEvents: [],
  helpedNPC: false,
  hasRisky: false,
  maxRawScore: 0,
  currentOptions: [],
  lastChosenOption: null,
  scenarioMeta: defaultMeta,
  resultSaved: false,
  saveError: null,
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  startGame: () => set({ screen: 'survey' }),

  setProfile: (profile) => {
    const companionsAlive = [...profile.companions]
    set({ profile, companionsAlive, screen: 'profile_card' })
  },

  confirmProfile: () => set({ screen: 'scenario_select' }),

  selectScenario: (scenarioId: string) => {
    const scenario = allScenarios[scenarioId]
    if (!scenario) return
    set({
      selectedScenarioId: scenarioId,
      scenarioId: scenarioId,
      scenarioMeta: scenario.meta,
      screen: 'intro',
    })
  },

  startScenario: () => {
    const { profile, selectedScenarioId } = get()
    if (!selectedScenarioId) return

    const scenario = allScenarios[selectedScenarioId]
    if (!scenario) return

    const firstQuestionId = scenario.firstQuestionId
    const firstQuestion = scenario.questions[firstQuestionId]
    const rawOptions = profile && firstQuestion
      ? filterOptionsByProfile(firstQuestion.options, profile)
      : firstQuestion?.options ?? []

    set({
      screen: 'question',
      currentQuestionId: firstQuestionId,
      currentOptions: shuffle(rawOptions),
      startTime: new Date(),
      gameStatus: 'playing',
      maxRawScore: 0,
    })
  },

  selectOption: (option) => {
    const state = get()
    const { score, consecutiveOptimal, hasRisky, questionHistory, selectedScenarioId, maxRawScore, currentOptions } = state

    const scenario = selectedScenarioId ? allScenarios[selectedScenarioId] : null
    const currentQuestion = scenario?.questions[state.currentQuestionId]
    const isTimedQuestion = !!currentQuestion?.timeLimit
    const earned = calcScore(option.type, option.scoreDelta, false, isTimedQuestion)

    const historyEntry: QuestionHistory = {
      questionId: state.currentQuestionId,
      selectedOptionId: option.id,
      optionType: option.type,
      scoreEarned: earned,
      timedOut: false,
    }

    const newConsecutive = option.type === 'OPTIMAL' ? consecutiveOptimal + 1 : 0
    const newHasRisky = hasRisky || option.type === 'RISKY'

    // NPC help check: Q007 OPTIMAL options (kept for backwards compat with S1)
    const helpedNPC = state.helpedNPC ||
      (state.currentQuestionId === 'S1_Q007' &&
        (option.id === 'S1_Q007_A' || option.id === 'S1_Q007_D'))

    // 累計本題最高可得分（供分數標準化用）
    const questionMax = Math.max(0, ...currentOptions.map(o => o.scoreDelta))

    set({
      lastChosenOption: option,
      score: score + earned,
      maxRawScore: maxRawScore + questionMax,
      questionHistory: [...questionHistory, historyEntry],
      consecutiveOptimal: newConsecutive,
      hasRisky: newHasRisky,
      helpedNPC,
      screen: 'feedback',
    })
  },

  advanceQuestion: () => {
    const { lastChosenOption, profile, selectedScenarioId } = get()
    if (!lastChosenOption) return

    if (lastChosenOption.nextQuestionId === 'GAME_OVER' || lastChosenOption.type === 'FATAL') {
      set({
        screen: 'gameover',
        gameStatus: 'failed',
        failureType: 'DEATH',
        endTime: new Date(),
      })
      return
    }

    if (lastChosenOption.nextQuestionId === 'SCENARIO_COMPLETE') {
      const currentState = get()
      const bonuses = calcBonuses(currentState)
      const bonusTotal = bonuses.reduce((sum, b) => sum + b.points, 0)
      // 標準化：最高獎勵合計 90 分，答題部分對應 410 分，總和上限 500
      const MAX_BONUS = 90
      const MAX_ANSWER = 500 - MAX_BONUS
      const normalized = currentState.maxRawScore > 0
        ? Math.round((currentState.score / currentState.maxRawScore) * MAX_ANSWER)
        : currentState.score
      set({
        screen: 'result',
        gameStatus: 'completed',
        endTime: new Date(),
        score: Math.min(500, normalized + bonusTotal),
        bonusEvents: bonuses,
      })
      return
    }

    const scenario = selectedScenarioId ? allScenarios[selectedScenarioId] : null
    if (!scenario) return

    const nextQuestion = scenario.questions[lastChosenOption.nextQuestionId]
    if (!nextQuestion) return

    const rawOpts = profile
      ? filterOptionsByProfile(nextQuestion.options, profile)
      : nextQuestion.options

    set({
      screen: 'question',
      currentQuestionId: nextQuestion.id,
      currentOptions: shuffle(rawOpts),
      lastChosenOption: null,
    })
  },

  restartScenario: () => {
    const { profile, selectedScenarioId } = get()
    if (!selectedScenarioId) return

    const scenario = allScenarios[selectedScenarioId]
    if (!scenario) return

    const firstQuestionId = scenario.firstQuestionId
    const firstQuestion = scenario.questions[firstQuestionId]
    const rawOpts2 = profile && firstQuestion
      ? filterOptionsByProfile(firstQuestion.options, profile)
      : firstQuestion?.options ?? []

    set({
      screen: 'question',
      currentQuestionId: firstQuestionId,
      currentOptions: shuffle(rawOpts2),
      questionHistory: [],
      score: 0,
      maxRawScore: 0,
      riskLevel: 0,
      injuryLevel: 0,
      resourceLevel: 100,
      gameStatus: 'playing',
      failureType: undefined,
      startTime: new Date(),
      endTime: null,
      consecutiveOptimal: 0,
      bonusEvents: [],
      helpedNPC: false,
      hasRisky: false,
      lastChosenOption: null,
    })
  },

  fullReset: () => set({ ...initialState, sessionId: crypto.randomUUID() }),

  goToWishPool: () => set({ screen: 'wishpool' }),
  goToAccount: () => set({ screen: 'account' }),
  goToStart: () => set({ screen: 'start' }),

  saveResult: async (userId: string, meta?: { displayName?: string; country?: string; avatarUrl?: string }) => {
    const state = get()
    const timeTaken = state.endTime && state.startTime
      ? Math.round((state.endTime.getTime() - state.startTime.getTime()) / 1000)
      : 0

    const { error } = await supabase.from('zerohour_results').insert({
      user_id: userId,
      session_id: state.sessionId,
      scenario_id: state.scenarioId,
      grade: getGrade(state.score),
      score: state.score,
      question_count: state.questionHistory.length,
      profile: state.profile ?? {},
      question_history: state.questionHistory,
      bonus_events: state.bonusEvents,
      time_taken: timeTaken,
      unlocked: false,
      display_name: meta?.displayName ?? null,
      country: meta?.country ?? null,
      avatar_url: meta?.avatarUrl ?? null,
    })

    if (error) {
      set({ saveError: error.message })
    } else {
      set({ resultSaved: true, saveError: null })
    }
  },
}))
