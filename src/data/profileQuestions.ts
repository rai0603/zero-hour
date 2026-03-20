export interface SurveyOption {
  value: string
  label: string
}

export interface SurveyQuestion {
  id: keyof import('../types').PlayerProfile
  question: string
  multiSelect: boolean
  options: SurveyOption[]
}

export const profileQuestions: SurveyQuestion[] = [
  {
    id: 'gender',
    question: 'Q1. 您目前的性別',
    multiSelect: false,
    options: [
      { value: 'male', label: '男性' },
      { value: 'female', label: '女性' },
      { value: 'other', label: '不願透露' },
    ],
  },
  {
    id: 'ageGroup',
    question: 'Q2. 您目前的年齡層',
    multiSelect: false,
    options: [
      { value: 'under18', label: '18 歲以下' },
      { value: '18-35', label: '18～35 歲' },
      { value: '36-55', label: '36～55 歲' },
      { value: 'over56', label: '56 歲以上' },
    ],
  },
  {
    id: 'location',
    question: 'Q3. 您目前的居住環境',
    multiSelect: false,
    options: [
      { value: 'urban', label: '都市市區（台北、台中、高雄等市中心）' },
      { value: 'suburban', label: '郊區（縣市邊緣、工業區附近）' },
      { value: 'rural', label: '鄉村農村' },
      { value: 'mountain', label: '山區（海拔 500 公尺以上）' },
      { value: 'coastal', label: '海岸／漁村地區' },
      { value: 'island', label: '離島（澎湖、金門、馬祖等）' },
    ],
  },
  {
    id: 'companions',
    question: 'Q4. 您目前同住或經常在一起的人員（複選）',
    multiSelect: true,
    options: [
      { value: 'alone', label: '單獨一人' },
      { value: 'partner', label: '伴侶／配偶' },
      { value: 'children', label: '未成年子女' },
      { value: 'elderly', label: '年邁父母／長輩' },
      { value: 'roommate', label: '室友' },
      { value: 'pet', label: '寵物' },
    ],
  },
  {
    id: 'vehicles',
    question: 'Q5. 您目前擁有的交通工具（複選）',
    multiSelect: true,
    options: [
      { value: 'none', label: '無（僅靠大眾交通）' },
      { value: 'motorcycle', label: '機車／摩托車' },
      { value: 'car', label: '自用轎車' },
      { value: 'truck', label: '貨車／廂型車' },
      { value: 'bicycle', label: '自行車' },
      { value: 'ev', label: '電動車（電動機車或電動汽車）' },
    ],
  },
  {
    id: 'supplies',
    question: 'Q6. 您家中目前備有哪些物資？（複選）',
    multiSelect: true,
    options: [
      { value: 'firstAidKit', label: '基本急救包' },
      { value: 'emergencyFood', label: '緊急糧食（罐頭／乾糧，3 天份以上）' },
      { value: 'waterStorage', label: '飲用水儲備（每人至少 3 公升 / 天 × 3 天）' },
      { value: 'flashlight', label: '手電筒／頭燈與電池' },
      { value: 'none', label: '以上皆無' },
      { value: 'fullKit72h', label: '有完整的 72 小時家庭緊急包' },
    ],
  },
  {
    id: 'healthStatus',
    question: 'Q7. 您目前的健康狀況',
    multiSelect: false,
    options: [
      { value: 'healthy', label: '健康，無特殊狀況' },
      { value: 'chronic', label: '輕度慢性病（高血壓、糖尿病等，有規律用藥）' },
      { value: 'mobility', label: '行動不便或需要輔具' },
      { value: 'pregnant', label: '懷孕中' },
    ],
  },
  {
    id: 'occupation',
    question: 'Q8. 您從事的職業類別',
    multiSelect: false,
    options: [
      { value: 'general', label: '一般上班族／學生' },
      { value: 'medical', label: '醫療／護理相關' },
      { value: 'military', label: '軍警／消防救護相關' },
      { value: 'agriculture', label: '農漁牧業' },
      { value: 'service', label: '服務業／餐飲零售' },
      { value: 'other', label: '其他' },
    ],
  },
  {
    id: 'selfRatedKnowledge',
    question: 'Q9. 您對災難應變的了解程度（自評）',
    multiSelect: false,
    options: [
      { value: 'none', label: '完全不了解' },
      { value: 'basic', label: '略有耳聞，但未受過訓練' },
      { value: 'drill', label: '曾參與過防災演習' },
      { value: 'trained', label: '有系統學習過急救／求生技能' },
    ],
  },
]
