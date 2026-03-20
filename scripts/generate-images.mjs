/**
 * 零時生存 ZERO HOUR — 批次生成題目圖片
 * 使用 Google Imagen 4 Fast API，根據題目 situationText 自動產生提示詞
 *
 * 執行全部：  node scripts/generate-images.mjs
 * 指定情境：  node scripts/generate-images.mjs S1
 * 指定單題：  node scripts/generate-images.mjs S1_Q003
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

// 讀取 API Key
const envContent = fs.readFileSync(path.join(ROOT, '.env'), 'utf-8')
const API_KEY = envContent.match(/GOOGLE_AI_API_KEY=(.+)/)?.[1]?.trim()
if (!API_KEY) throw new Error('找不到 GOOGLE_AI_API_KEY')

const MODEL = 'imagen-4.0-fast-generate-001'
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:predict?key=${API_KEY}`
const DELAY_MS = 3000

// 情境 → 資料夾 mapping
const SCENARIO_DIRS = {
  S1: 's1', S2: 's2', S3: 's3',
  S4: 's4', S5: 's5', S6: 's6', S7: 's7',
}

// 情境視覺風格前綴（讓圖片保持一致的氛圍）
const STYLE_SUFFIX = ', photorealistic, cinematic lighting, dramatic, no text, no watermark, Taiwan setting'

const SCENARIO_STYLE = {
  S1: 'post-earthquake urban Taiwan',
  S2: 'tsunami warning coastal Taiwan',
  S3: 'wartime city Taiwan, missile alert',
  S4: 'super typhoon Taiwan, flooding',
  S5: 'terrorist attack public space Taiwan',
  S6: 'COVID pandemic daily life Taiwan, modern Taiwanese apartment building, convenience store, pharmacy, office, real people wearing masks, contemporary Taiwan urban environment, natural lighting, documentary photography style',
  S7: 'unknown creature attack Taiwan',
}

// 讀取所有 JSON 題庫
function loadAllQuestions() {
  const jsonDir = path.join(ROOT, 'src/data/json')
  const files = fs.readdirSync(jsonDir).filter(f => f.endsWith('.json'))
  const allQuestions = []

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(jsonDir, file), 'utf-8'))
    const scenarioId = data.scenario.id
    const style = SCENARIO_STYLE[scenarioId] ?? 'disaster Taiwan'

    for (const q of data.questions) {
      allQuestions.push({
        id: q.id,
        scenarioId,
        situationText: q.situation,
        style,
      })
    }
  }

  return allQuestions
}

// 從情境文字產生英文圖片提示詞
function buildPrompt(situationText, style) {
  // 從中文情境提取關鍵場景詞，組成英文提示詞
  // 用 Claude-style prompt：直接把中文情境當作語境，加上英文風格指令
  return `Photorealistic scene: ${style}. Scene description based on: "${situationText.slice(0, 120)}". Dramatic tension, cinematic composition, Taiwan urban/rural environment${STYLE_SUFFIX}`
}

async function generateImage(questionId, scenarioId, prompt) {
  const dir = path.join(ROOT, 'public/images', SCENARIO_DIRS[scenarioId] ?? scenarioId.toLowerCase())
  fs.mkdirSync(dir, { recursive: true })
  const outPath = path.join(dir, `${questionId}.png`)

  if (fs.existsSync(outPath)) {
    console.log(`⏭  ${questionId} 已存在，跳過`)
    return
  }

  console.log(`🎨 生成 ${questionId}...`)

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: { sampleCount: 1 },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`❌ ${questionId} 失敗：${res.status}`, err.slice(0, 200))
    return
  }

  const data = await res.json()
  const b64 = data.predictions?.[0]?.bytesBase64Encoded
  if (!b64) {
    console.error(`❌ ${questionId} 無回傳圖片`)
    return
  }

  fs.writeFileSync(outPath, Buffer.from(b64, 'base64'))
  console.log(`✅ ${questionId} → public/images/${SCENARIO_DIRS[scenarioId]}/${questionId}.png`)
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function main() {
  const arg = process.argv[2] // e.g. "S1", "S1_Q003", or undefined

  let questions = loadAllQuestions()

  if (arg) {
    if (arg.includes('_Q')) {
      // 單題模式
      questions = questions.filter(q => q.id === arg)
      if (!questions.length) {
        console.error(`找不到題目 ID：${arg}`)
        process.exit(1)
      }
    } else {
      // 整個情境
      questions = questions.filter(q => q.scenarioId === arg)
      if (!questions.length) {
        console.error(`找不到情境：${arg}`)
        process.exit(1)
      }
    }
  }

  console.log(`\n🚀 開始批次生成，共 ${questions.length} 張\n`)

  for (let i = 0; i < questions.length; i++) {
    const { id, scenarioId, situationText, style } = questions[i]
    const prompt = buildPrompt(situationText, style)
    await generateImage(id, scenarioId, prompt)
    if (i < questions.length - 1) await sleep(DELAY_MS)
  }

  console.log('\n🎉 完成！')
}

main().catch(err => {
  console.error('腳本錯誤：', err)
  process.exit(1)
})
