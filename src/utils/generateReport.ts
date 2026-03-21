import { type QuestionHistory, type BonusEvent, type PlayerProfile, type ScenarioMeta } from '../types'
import { getGradeInfo } from '../engine/scoreEngine'
import { allScenarios } from '../data/scenarioLoader'

const TYPE_LABEL: Record<string, string> = {
  OPTIMAL: '最佳選擇',
  SUBOPTIMAL: '次佳選擇',
  RISKY: '高風險',
  FATAL: '致命選擇',
  DYNAMIC: '動態結果',
}

const TYPE_COLOR: Record<string, string> = {
  OPTIMAL: '#16a34a',
  SUBOPTIMAL: '#d97706',
  RISKY: '#dc2626',
  FATAL: '#7f1d1d',
  DYNAMIC: '#6366f1',
}

const PROFILE_LABELS: Record<string, Record<string, string>> = {
  gender: { male: '男性', female: '女性', other: '不願透露' },
  ageGroup: { under18: '18 歲以下', '18-35': '18～35 歲', '36-55': '36～55 歲', over56: '56 歲以上' },
  location: { urban: '都市市區', suburban: '郊區', rural: '鄉村農村', mountain: '山區', coastal: '海岸／漁村', island: '離島' },
  healthStatus: { healthy: '健康，無特殊狀況', chronic: '輕度慢性病', mobility: '行動不便或需輔具', pregnant: '懷孕中' },
  selfRatedKnowledge: { none: '完全不了解', basic: '略有耳聞，未受訓', drill: '曾參與防災演習', trained: '有系統學習過急救/求生' },
  occupation: { general: '一般上班族／學生', medical: '醫療／護理', military: '軍警／消防救護', agriculture: '農漁牧業', service: '服務業／餐飲零售', other: '其他' },
  companions: { alone: '單獨一人', partner: '伴侶／配偶', children: '未成年子女', elderly: '年邁父母／長輩', roommate: '室友', pet: '寵物' },
  vehicles: { none: '無（僅靠大眾交通）', motorcycle: '機車／摩托車', car: '自用轎車', truck: '貨車／廂型車', bicycle: '自行車', ev: '電動車' },
  supplies: { firstAidKit: '基本急救包', emergencyFood: '緊急糧食', waterStorage: '飲用水儲備', flashlight: '手電筒／頭燈', none: '以上皆無', fullKit72h: '72 小時家庭緊急包' },
}

function label(category: string, value: string) {
  return PROFILE_LABELS[category]?.[value] ?? value
}

function labelArray(category: string, values: string[]) {
  return values.map(v => label(category, v)).join('、')
}

function gradeColor(grade: string) {
  const map: Record<string, string> = {
    S: '#eab308', A: '#22c55e', B: '#3b82f6', C: '#f97316', D: '#ef4444', F: '#6b7280',
  }
  return map[grade] ?? '#fff'
}

export function generateReport(params: {
  score: number
  questionHistory: QuestionHistory[]
  bonusEvents: BonusEvent[]
  scenarioMeta: ScenarioMeta
  selectedScenarioId: string
  profile: PlayerProfile | null
}) {
  const { score, questionHistory, bonusEvents, scenarioMeta, selectedScenarioId, profile } = params
  const { grade, roleTitle, description } = getGradeInfo(score)
  const scenario = allScenarios[selectedScenarioId]

  const optimalCount = questionHistory.filter(q => q.optionType === 'OPTIMAL').length
  const suboptimalCount = questionHistory.filter(q => q.optionType === 'SUBOPTIMAL').length
  const riskyCount = questionHistory.filter(q => q.optionType === 'RISKY').length
  const dateStr = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })

  const questionRows = questionHistory.map((h, i) => {
    const q = scenario?.questions[h.questionId]
    if (!q) return ''
    const chosenOption = q.options.find(o => o.id === h.selectedOptionId)
    const typeColor = TYPE_COLOR[h.optionType] ?? '#888'
    const typeLabel = TYPE_LABEL[h.optionType] ?? h.optionType

    return `
      <div class="question-block">
        <div class="q-header">
          <span class="q-num">Q${i + 1}</span>
          <span class="q-phase">${q.phaseName}</span>
          <span class="q-score">+${h.scoreEarned} 分</span>
        </div>
        <p class="q-situation">${q.situationText}</p>
        <p class="q-question">❓ ${q.questionText}</p>
        ${chosenOption ? `
          <div class="chosen-option" style="border-left-color: ${typeColor}">
            <div class="chosen-header">
              <span class="chosen-label" style="background:${typeColor}">你的選擇・${typeLabel}</span>
            </div>
            <p class="chosen-text">${chosenOption.text}</p>
            ${chosenOption.consequenceText ? `<p class="consequence">📌 ${chosenOption.consequenceText}</p>` : ''}
            ${chosenOption.knowledge ? `<p class="knowledge">💡 ${chosenOption.knowledge}</p>` : ''}
          </div>
        ` : ''}
      </div>
    `
  }).join('')

  const bonusRows = bonusEvents.length > 0 ? `
    <div class="section">
      <h2>額外獎勵</h2>
      ${bonusEvents.map(b => `
        <div class="bonus-row">
          <span>${b.label}</span>
          <span class="bonus-pts">+${b.points} 分</span>
        </div>
      `).join('')}
    </div>
  ` : ''

  const profileSection = profile ? `
    <div class="section">
      <h2>個人檔案</h2>
      <div class="profile-grid">
        <div class="profile-item"><span class="profile-key">性別</span><span>${label('gender', profile.gender)}</span></div>
        <div class="profile-item"><span class="profile-key">年齡</span><span>${label('ageGroup', profile.ageGroup)}</span></div>
        <div class="profile-item"><span class="profile-key">居住地</span><span>${label('location', profile.location)}</span></div>
        <div class="profile-item"><span class="profile-key">職業</span><span>${label('occupation', profile.occupation)}</span></div>
        <div class="profile-item"><span class="profile-key">健康狀況</span><span>${label('healthStatus', profile.healthStatus)}</span></div>
        <div class="profile-item"><span class="profile-key">防災知識</span><span>${label('selfRatedKnowledge', profile.selfRatedKnowledge)}</span></div>
        ${profile.companions.length > 0 ? `<div class="profile-item"><span class="profile-key">同住人員</span><span>${labelArray('companions', profile.companions)}</span></div>` : ''}
        ${profile.vehicles.length > 0 ? `<div class="profile-item"><span class="profile-key">交通工具</span><span>${labelArray('vehicles', profile.vehicles)}</span></div>` : ''}
        ${profile.supplies.length > 0 ? `<div class="profile-item"><span class="profile-key">現有物資</span><span>${labelArray('supplies', profile.supplies)}</span></div>` : ''}
      </div>
    </div>
  ` : ''

  const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <title>零時生存・完整分析報告</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, "Noto Sans TC", "Microsoft JhengHei", sans-serif;
      color: #1a1a1a;
      background: #fff;
      padding: 0;
      font-size: 14px;
      line-height: 1.6;
    }
    .cover {
      background: #0a0a0a;
      color: #fff;
      padding: 48px 32px;
      text-align: center;
      page-break-after: always;
    }
    .cover-logo { font-size: 11px; letter-spacing: 4px; color: #f97316; margin-bottom: 8px; }
    .cover-title { font-size: 32px; font-weight: 900; letter-spacing: 8px; margin-bottom: 4px; }
    .cover-sub { font-size: 14px; color: #f97316; letter-spacing: 2px; margin-bottom: 32px; }
    .cover-scenario { font-size: 13px; color: #9ca3af; margin-bottom: 48px; }
    .grade-circle {
      width: 120px; height: 120px; border-radius: 50%;
      border: 4px solid ${gradeColor(grade)};
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
    }
    .grade-letter { font-size: 64px; font-weight: 900; color: ${gradeColor(grade)}; line-height: 1; }
    .cover-role { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
    .cover-score { font-size: 32px; font-weight: 900; color: ${gradeColor(grade)}; }
    .cover-score-max { font-size: 16px; color: #6b7280; }
    .cover-date { font-size: 11px; color: #4b5563; margin-top: 48px; }
    .content { padding: 32px; max-width: 800px; margin: 0 auto; }
    .section { margin-bottom: 32px; }
    .section h2 {
      font-size: 13px; font-weight: 700; letter-spacing: 2px;
      color: #f97316; border-bottom: 1px solid #fed7aa;
      padding-bottom: 6px; margin-bottom: 16px;
    }
    .description-box {
      background: #fafafa; border: 1px solid #e5e7eb;
      border-radius: 8px; padding: 16px;
      font-size: 14px; color: #374151; line-height: 1.7;
    }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .stat-card {
      border-radius: 8px; padding: 16px; text-align: center;
      border: 1px solid;
    }
    .stat-card.optimal { background: #f0fdf4; border-color: #bbf7d0; }
    .stat-card.suboptimal { background: #fffbeb; border-color: #fde68a; }
    .stat-card.risky { background: #fef2f2; border-color: #fecaca; }
    .stat-num { font-size: 28px; font-weight: 900; display: block; }
    .stat-num.optimal { color: #16a34a; }
    .stat-num.suboptimal { color: #d97706; }
    .stat-num.risky { color: #dc2626; }
    .stat-label { font-size: 11px; color: #6b7280; margin-top: 4px; }
    .bonus-row {
      display: flex; justify-content: space-between;
      padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px;
    }
    .bonus-pts { color: #16a34a; font-weight: 700; }
    .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .profile-item {
      display: flex; gap: 8px; font-size: 13px;
      padding: 6px 0; border-bottom: 1px solid #f3f4f6;
    }
    .profile-key { color: #9ca3af; min-width: 72px; }
    .question-block {
      border: 1px solid #e5e7eb; border-radius: 8px;
      padding: 16px; margin-bottom: 16px;
      page-break-inside: avoid;
    }
    .q-header {
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 10px;
    }
    .q-num {
      background: #1a1a1a; color: #fff;
      font-size: 11px; font-weight: 700;
      padding: 2px 8px; border-radius: 4px;
    }
    .q-phase { font-size: 11px; color: #9ca3af; flex: 1; }
    .q-score { font-size: 12px; color: #16a34a; font-weight: 700; }
    .q-situation { font-size: 13px; color: #4b5563; margin-bottom: 8px; }
    .q-question { font-size: 14px; font-weight: 700; color: #111; margin-bottom: 10px; }
    .chosen-option { border-left: 3px solid; padding-left: 12px; }
    .chosen-header { margin-bottom: 6px; }
    .chosen-label {
      font-size: 11px; color: #fff; font-weight: 700;
      padding: 2px 8px; border-radius: 4px;
    }
    .chosen-text { font-size: 13px; color: #374151; margin-bottom: 8px; }
    .consequence {
      font-size: 12px; color: #6b7280; background: #f9fafb;
      border-radius: 4px; padding: 8px; margin-top: 6px;
    }
    .knowledge {
      font-size: 12px; color: #1d4ed8; background: #eff6ff;
      border-radius: 4px; padding: 8px; margin-top: 6px;
    }
    .sponsor-box {
      border: 1.5px dashed #d1d5db; border-radius: 8px;
      padding: 20px; text-align: center; margin-top: 32px; margin-bottom: 16px;
    }
    .sponsor-label {
      font-size: 10px; font-weight: 700; letter-spacing: 3px;
      color: #9ca3af; margin-bottom: 6px;
    }
    .sponsor-desc {
      font-size: 12px; color: #6b7280; margin-bottom: 12px;
    }
    .sponsor-link {
      display: inline-block; font-size: 12px; font-weight: 700;
      color: #f97316; border: 1px solid #f97316;
      padding: 6px 16px; border-radius: 6px; text-decoration: none;
    }
    .footer {
      text-align: center; color: #9ca3af; font-size: 11px;
      padding: 24px; border-top: 1px solid #e5e7eb; margin-top: 16px;
    }
    @media print {
      body { padding: 0; }
      .cover { page-break-after: always; }
      .question-block { page-break-inside: avoid; }
    }
  </style>
</head>
<body>

  <div class="cover">
    <p class="cover-logo">// 完整分析報告</p>
    <h1 class="cover-title">零時生存</h1>
    <p class="cover-sub">ZERO HOUR</p>
    <p class="cover-scenario">情境 ${scenarioMeta.id}：${scenarioMeta.title}・${scenarioMeta.subtitle}</p>

    <div class="grade-circle">
      <span class="grade-letter">${grade}</span>
    </div>
    <p class="cover-role">${roleTitle}</p>
    <p style="margin-top:8px;">
      <span class="cover-score">${score}</span>
      <span class="cover-score-max"> / 500 分</span>
    </p>
    <p class="cover-date">測試日期：${dateStr}・共作答 ${questionHistory.length} 題</p>
  </div>

  <div class="content">

    <div class="section">
      <h2>// 整體評語</h2>
      <div class="description-box">${description}</div>
    </div>

    <div class="section">
      <h2>// 答題統計</h2>
      <div class="stats-grid">
        <div class="stat-card optimal">
          <span class="stat-num optimal">${optimalCount}</span>
          <p class="stat-label">最佳選擇</p>
        </div>
        <div class="stat-card suboptimal">
          <span class="stat-num suboptimal">${suboptimalCount}</span>
          <p class="stat-label">次佳選擇</p>
        </div>
        <div class="stat-card risky">
          <span class="stat-num risky">${riskyCount}</span>
          <p class="stat-label">高風險選擇</p>
        </div>
      </div>
    </div>

    ${bonusRows}
    ${profileSection}

    <div class="section">
      <h2>// 逐題解析</h2>
      ${questionRows}
    </div>

    <div class="sponsor-box">
      <p class="sponsor-label">// 贊助版位</p>
      <p class="sponsor-desc">您的品牌可以出現在這份報告中，觸及關心台灣防災的受眾</p>
      <a class="sponsor-link" href="mailto:?subject=零時生存廣告合作洽詢&body=您好，我想了解零時生存（ZERO HOUR）的廣告版位合作方案，請問報價與詳細資訊？" onclick="this.href='mailto:rai0603@gmail.com?subject=' + encodeURIComponent('零時生存廣告合作洽詢') + '&body=' + encodeURIComponent('您好，我想了解零時生存（ZERO HOUR）的廣告版位合作方案，請問報價與詳細資訊？')">
        📩 洽詢廣告合作
      </a>
    </div>

    <div class="footer">
      零時生存 ZERO HOUR・台灣災難應變能力情境測試<br>
      本報告內容僅供教育參考，實際災難應變請遵循政府及專業機構指引。
    </div>

  </div>

  <script>
    window.onload = function() { window.print() }
  </script>
</body>
</html>`

  const win = window.open('', '_blank')
  if (!win) {
    alert('請允許彈出視窗以產生報告')
    return
  }
  win.document.write(html)
  win.document.close()
}
