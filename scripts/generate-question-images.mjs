import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const API_KEY = 'AIzaSyBaYEStSRPP8OSBA0iO_8eQlfSV5_gLMqc'
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${API_KEY}`
const DATA_DIR = path.join(__dirname, '../src/data/json')
const OUT_BASE = path.join(__dirname, '../public/images')

// 情境背景描述（用於強化 prompt 一致性）
const SCENARIO_CONTEXT = {
  S1: 'earthquake disaster in Taiwan, collapsed buildings, rubble, dust, emergency, night, realistic',
  S2: 'tsunami warning in Taiwan coastal city, flooding, evacuation, urgent, realistic',
  S3: 'military conflict in Taiwan, missile attack, wartime, urban warfare, civilians, realistic',
  S4: 'super typhoon in Taiwan, heavy rain, flooding, mudslide, storm, realistic',
  S5: 'terrorist attack explosion in Taiwan public place, smoke, chaos, emergency response, realistic',
  S6: 'pandemic outbreak in Taiwan, quarantine, empty streets, hazmat suits, realistic',
  S7: 'unknown creature attack in Taiwan, mysterious threat, panic, night, realistic',
}

const STYLE = 'cinematic photography, dramatic lighting, realistic, dark moody atmosphere, 16:9 wide shot'

async function generateImage(prompt) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: '16:9',
        outputOptions: { mimeType: 'image/png' },
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    const parsed = JSON.parse(err)
    // 如果是 rate limit，回傳 retry delay
    if (parsed.error?.code === 429) {
      const delay = parsed.error?.details?.find(d => d.retryDelay)?.retryDelay
      const seconds = delay ? parseInt(delay) : 60
      throw { type: 'rateLimit', retryAfter: seconds }
    }
    throw new Error(`API error ${res.status}: ${err.slice(0, 200)}`)
  }

  const json = await res.json()
  const b64 = json.predictions?.[0]?.bytesBase64Encoded
  if (!b64) throw new Error(`No image in response`)
  return Buffer.from(b64, 'base64')
}

function buildPrompt(scenarioId, situation) {
  const context = SCENARIO_CONTEXT[scenarioId] ?? 'disaster scene in Taiwan, realistic'
  // 取情境文字前 120 字作為 prompt 核心
  const core = situation.replace(/\n/g, ' ').trim().slice(0, 120)
  return `${core}, ${context}, ${STYLE}`
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function main() {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'))

  // 收集所有需要生成的任務
  const tasks = []
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'))
    const scenarioId = data.scenario.id
    const outDir = path.join(OUT_BASE, scenarioId.toLowerCase())
    fs.mkdirSync(outDir, { recursive: true })

    for (const q of data.questions) {
      const outPath = path.join(outDir, `${q.id}.png`)
      if (fs.existsSync(outPath)) continue // skip already generated
      const situation = q.situation ?? q.situationText ?? ''
      if (!situation.trim()) continue
      tasks.push({ scenarioId, qId: q.id, situation, outPath })
    }
  }

  console.log(`📋 Total to generate: ${tasks.length} images`)
  if (tasks.length === 0) { console.log('✅ All images already exist!'); return }

  let done = 0
  let i = 0
  while (i < tasks.length) {
    const { scenarioId, qId, situation, outPath } = tasks[i]
    const prompt = buildPrompt(scenarioId, situation)

    process.stdout.write(`[${done + 1}/${tasks.length}] ${scenarioId}/${qId}...`)
    try {
      const buf = await generateImage(prompt)
      fs.writeFileSync(outPath, buf)
      console.log(` ✅ (${Math.round(buf.length / 1024)}KB)`)
      done++
      i++
      // 每 10 張停 62 秒（rate limit: 10 RPM）
      if (done % 10 === 0 && i < tasks.length) {
        console.log('⏸  Rate limit pause 62s...')
        await sleep(62000)
      } else {
        await sleep(500)
      }
    } catch (e) {
      if (e?.type === 'rateLimit') {
        const wait = (e.retryAfter + 2) * 1000
        console.log(` ⏳ Rate limit, waiting ${e.retryAfter}s...`)
        await sleep(wait)
        // retry same task (don't increment i)
      } else {
        console.log(` ❌ ${e.message}`)
        i++ // skip on other errors
      }
    }
  }

  console.log(`\n🎉 Done! Generated ${done} images.`)
}

main()
