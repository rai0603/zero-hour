export type OptionType = 'OPTIMAL' | 'SUBOPTIMAL' | 'RISKY' | 'FATAL' | 'DYNAMIC'

export type GameStatus = 'playing' | 'completed' | 'failed'

export type Screen = 'start' | 'survey' | 'profile_card' | 'scenario_select' | 'intro' | 'question' | 'feedback' | 'gameover' | 'result' | 'wishpool' | 'account'

export type FailureType =
  | 'DEATH'
  | 'INJURY'
  | 'CAPTURED'
  | 'INFECTED'
  | 'RESOURCE_DEPLETED'
  | 'MENTAL_COLLAPSE'

export interface PlayerProfile {
  gender: string
  ageGroup: string
  location: string
  companions: string[]
  vehicles: string[]
  supplies: string[]
  healthStatus: string
  occupation: string
  selfRatedKnowledge: string
}

export interface ProfileCondition {
  field: keyof PlayerProfile
  check: 'includes' | 'equals' | 'notIncludes'
  value: string
}

export interface Option {
  id: string
  text: string
  type: OptionType
  resolvedType?: OptionType
  scoreDelta: number
  nextQuestionId: string | 'GAME_OVER' | 'SCENARIO_COMPLETE'
  consequenceText: string
  knowledge?: string
  profileRequired?: ProfileCondition
}

export interface Question {
  id: string
  scenarioId: string
  phase: number
  phaseName: string
  situationText: string
  questionText: string
  options: Option[]
  timeLimit?: number
  knowledgeTags: string[]
}

export interface QuestionHistory {
  questionId: string
  selectedOptionId: string
  optionType: OptionType
  scoreEarned: number
  timedOut: boolean
}

export interface BonusEvent {
  label: string
  points: number
}

export interface GameState {
  sessionId: string
  profile: PlayerProfile | null
  scenarioId: string
  currentQuestionId: string
  questionHistory: QuestionHistory[]
  score: number
  riskLevel: number
  injuryLevel: number
  companionsAlive: string[]
  resourceLevel: number
  gameStatus: GameStatus
  failureType?: FailureType
  startTime: Date | null
  endTime: Date | null
  consecutiveOptimal: number
  bonusEvents: BonusEvent[]
  helpedNPC: boolean
  hasRisky: boolean
}

export interface ScenarioMeta {
  id: string
  title: string
  subtitle: string
  introText: string
  difficulty: number
  phaseNames: string[]
}

export type Grade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F'

export interface GradeInfo {
  grade: Grade
  roleTitle: string
  description: string
}
