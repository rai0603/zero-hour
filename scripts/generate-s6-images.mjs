/**
 * S6 疫情感染 — 專屬圖片生成（每題手工英文 prompt）
 * node scripts/generate-s6-images.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

const envContent = fs.readFileSync(path.join(ROOT, '.env'), 'utf-8')
const API_KEY = envContent.match(/GOOGLE_AI_API_KEY=(.+)/)?.[1]?.trim()
if (!API_KEY) throw new Error('找不到 GOOGLE_AI_API_KEY')

const MODEL = 'imagen-4.0-fast-generate-001'
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:predict?key=${API_KEY}`
const DELAY_MS = 3000
const OUT_DIR = path.join(ROOT, 'public/images/s6')
fs.mkdirSync(OUT_DIR, { recursive: true })

const STYLE = 'photorealistic documentary photography, natural lighting, modern Taiwan urban setting, no text, no watermark'

const PROMPTS = {
  S6_Q001: `A Taiwanese person standing at a crossroads decision — one path leads to a busy crowded Taiwan shopping mall with people wearing masks, another path leads to a quiet home desk. Split decision moment. ${STYLE}`,
  S6_Q002: `A Taiwanese person in a modern apartment looking at their smartphone showing social media panic posts about stockpiling, with a small pile of masks and supplies visible nearby. Worried expression. ${STYLE}`,
  S6_Q002_B: `A Taiwanese person alone at home, sitting anxiously by the window of a modern apartment, holding their smartphone, looking troubled and uncertain. Soft indoor light. ${STYLE}`,
  S6_Q003: `An elderly Taiwanese man (70s, wearing a mask) seen through a phone video call on a smartphone screen, looking frail and concerned. Modern Taiwan apartment background. ${STYLE}`,
  S6_Q003_B: `A large cardboard box overflowing with masks and hand sanitizer bottles in a Taiwan apartment. A TV news broadcast visible in background showing medical workers shortage. ${STYLE}`,
  S6_Q003_C: `A Taiwanese person standing outside an empty pharmacy shelf in Taiwan, all mask and hand sanitizer shelves completely bare. Overhead fluorescent lighting. Frustrated expression. ${STYLE}`,
  S6_Q004: `A Taiwanese person sitting at a desk, holding a COVID rapid test kit showing a negative result, looking uncertain and conflicted. Thermometer nearby showing mild fever. Modern home setting. ${STYLE}`,
  S6_Q004_B: `Interior of a car in Taiwan, elderly passenger (70s) and driver both wearing masks, both looking unwell. Tense atmosphere inside a vehicle. ${STYLE}`,
  S6_Q004_C: `Small cramped two-bedroom Taiwan apartment, family members in different rooms trying to isolate, doors closed, visible tension. One person lying on couch with a blanket. ${STYLE}`,
  S6_Q005: `A Taiwanese person lying in bed at home in isolation, surrounded by medicine bottles, tissues, and a smartphone screen showing health misinformation. Dim room, window curtains closed. ${STYLE}`,
  S6_Q005_B: `A modern Taiwan office space, several empty desks and chairs, a few remaining coworkers wearing masks looking concerned at each other, some workstations abandoned. ${STYLE}`,
  S6_Q006: `A food delivery bag placed outside an apartment door in Taiwan, door slightly ajar, a person's hand reaching out to take it. Hallway of a residential building. ${STYLE}`,
  S6_Q007: `A Taiwanese person returning to a bright modern Taiwan office, coworkers in masks looking at them with mixed expressions — some welcoming, some cautious. ${STYLE}`,
}

async function generateImage(questionId, prompt) {
  const outPath = path.join(OUT_DIR, `${questionId}.png`)
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
  console.log(`✅ ${questionId} → public/images/s6/${questionId}.png`)
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function main() {
  const entries = Object.entries(PROMPTS)
  console.log(`\n🚀 開始生成 S6 專屬圖片，共 ${entries.length} 張\n`)

  for (let i = 0; i < entries.length; i++) {
    const [id, prompt] = entries[i]
    await generateImage(id, prompt)
    if (i < entries.length - 1) await sleep(DELAY_MS)
  }

  console.log('\n🎉 完成！')
}

main().catch(err => {
  console.error('腳本錯誤：', err)
  process.exit(1)
})
