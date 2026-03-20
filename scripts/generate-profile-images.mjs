/**
 * 個人資訊問卷選項圖片生成（漫畫風）
 * node scripts/generate-profile-images.mjs
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
const DELAY_MS = 3500
const OUT_DIR = path.join(ROOT, 'public/images/profile')
fs.mkdirSync(OUT_DIR, { recursive: true })

const STYLE = 'manga comic illustration, bold clean outlines, flat colors, cel-shading, expressive characters, vibrant, square composition, no text, no watermark, no background clutter'

const PROMPTS = {
  // Q1 性別
  'gender_male':   `Friendly Taiwanese young adult man portrait, casual modern clothes, warm smile. ${STYLE}`,
  'gender_female': `Friendly Taiwanese young adult woman portrait, casual modern clothes, warm smile. ${STYLE}`,
  'gender_other':  `Gender-neutral Taiwanese young person portrait, casual modern clothes, friendly expression. ${STYLE}`,

  // Q2 年齡層
  'ageGroup_under18': `Taiwanese teenager in school uniform, backpack, energetic pose, high school student. ${STYLE}`,
  'ageGroup_18-35':   `Taiwanese young adult in modern casual outfit, confident, urban setting. ${STYLE}`,
  'ageGroup_36-55':   `Taiwanese middle-aged adult, professional attire, mature and reliable expression. ${STYLE}`,
  'ageGroup_over56':  `Taiwanese elderly person, silver hair, kind face, comfortable traditional clothing. ${STYLE}`,

  // Q3 居住環境
  'location_urban':    `Dense Taiwan city scene, tall apartment buildings, busy street, neon signs, night market atmosphere. ${STYLE}`,
  'location_suburban': `Taiwan suburban neighborhood, mid-rise buildings, tree-lined road, quieter streets, residential area. ${STYLE}`,
  'location_rural':    `Taiwan countryside, green rice paddy fields, traditional farmhouse, blue sky, peaceful rural scenery. ${STYLE}`,
  'location_mountain': `Taiwan mountain area, misty forested hillside, winding mountain road, high altitude village. ${STYLE}`,
  'location_coastal':  `Taiwan coastal fishing village, colorful fishing boats, ocean waves, seaside houses. ${STYLE}`,
  'location_island':   `Taiwan outlying island (Penghu style), windmill, coral reef coastline, turquoise sea, island scenery. ${STYLE}`,

  // Q4 同住人員
  'companions_alone':    `Single person living alone in a small modern Taiwan apartment, cozy solo life, one person cooking or reading. ${STYLE}`,
  'companions_partner':  `Happy Taiwanese couple together at home, partner holding hands, warm domestic scene. ${STYLE}`,
  'companions_children': `Taiwanese family with young children, parents playing with kids, cheerful home scene. ${STYLE}`,
  'companions_elderly':  `Taiwanese adult with elderly grandparent or parent, caring multigenerational family scene. ${STYLE}`,
  'companions_roommate': `Two or three young Taiwanese roommates sharing an apartment, casual shared living space. ${STYLE}`,
  'companions_pet':      `Taiwanese person cuddling with a cat or dog, happy pet owner at home, warm bond. ${STYLE}`,

  // Q5 交通工具
  'vehicles_none':       `Taiwanese person waiting at MRT station or bus stop, public transit, urban commuter. ${STYLE}`,
  'vehicles_motorcycle': `Taiwanese person riding a scooter/motorcycle, helmet on, Taiwan street traffic. ${STYLE}`,
  'vehicles_car':        `Taiwanese person driving a sedan car, highway or city road, steering wheel view. ${STYLE}`,
  'vehicles_truck':      `Taiwanese person driving a cargo truck or van, delivery vehicle, loading dock. ${STYLE}`,
  'vehicles_bicycle':    `Taiwanese person riding a bicycle, cycling lane, casual city ride, helmet. ${STYLE}`,
  'vehicles_ev':         `Taiwanese person with electric scooter or EV car plugged in charging, modern green transport. ${STYLE}`,

  // Q6 家中物資
  'supplies_firstAidKit':    `Red first aid kit box open showing bandages, antiseptic, medical supplies inside. ${STYLE}`,
  'supplies_emergencyFood':  `Stack of canned food, instant noodles, dry rations, emergency food supply shelf. ${STYLE}`,
  'supplies_waterStorage':   `Several large water jugs and water bottles stored neatly, emergency water supply. ${STYLE}`,
  'supplies_flashlight':     `Bright flashlight and spare batteries on a table, emergency lighting equipment. ${STYLE}`,
  'supplies_none':           `Empty kitchen shelf, bare pantry, person looking apologetic with empty hands, unprepared. ${STYLE}`,
  'supplies_fullKit72h':     `Complete 72-hour emergency backpack fully packed, organized survival kit contents spread out, disaster preparedness bag. ${STYLE}`,

  // Q7 健康狀況
  'healthStatus_healthy':   `Athletic healthy Taiwanese person exercising or stretching, vibrant energy, fit and well. ${STYLE}`,
  'healthStatus_chronic':   `Taiwanese person taking daily medication pills, blood pressure monitor on wrist, managed chronic condition. ${STYLE}`,
  'healthStatus_mobility':  `Taiwanese person using a walking cane or seated in wheelchair, dignified and capable. ${STYLE}`,
  'healthStatus_pregnant':  `Taiwanese pregnant woman in comfortable maternity clothes, gentle smile, hand on belly. ${STYLE}`,

  // Q8 職業
  'occupation_general':     `Taiwanese office worker at desk with laptop, or student with books, everyday work life. ${STYLE}`,
  'occupation_medical':     `Taiwanese doctor or nurse in white coat and scrubs, hospital or clinic setting, stethoscope. ${STYLE}`,
  'occupation_military':    `Taiwanese military officer, police officer, or firefighter in uniform, professional and strong. ${STYLE}`,
  'occupation_agriculture': `Taiwanese farmer in rice paddy or fisherman on boat, working the land or sea, rural labor. ${STYLE}`,
  'occupation_service':     `Taiwanese restaurant worker or retail store clerk in apron, friendly service industry worker. ${STYLE}`,
  'occupation_other':       `Silhouette of various diverse occupations, multiple job types, varied work scenes collage. ${STYLE}`,

  // Q9 自評防災知識
  'selfRatedKnowledge_none':    `Taiwanese person looking confused and blank at a disaster warning sign, head scratch, no knowledge. ${STYLE}`,
  'selfRatedKnowledge_basic':   `Taiwanese person casually reading news about disaster preparedness on phone, vague awareness. ${STYLE}`,
  'selfRatedKnowledge_drill':   `Taiwanese people participating in emergency evacuation drill, fire drill at office or school. ${STYLE}`,
  'selfRatedKnowledge_trained': `Taiwanese person demonstrating CPR or first aid, professional training certificate, confident expert. ${STYLE}`,
}

async function generateImage(filename, prompt) {
  const outPath = path.join(OUT_DIR, `${filename}.png`)
  if (fs.existsSync(outPath)) {
    console.log(`⏭  ${filename} 已存在，跳過`)
    return
  }

  console.log(`🎨 生成 ${filename}...`)

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
    console.error(`❌ ${filename} 失敗：${res.status}`, err.slice(0, 200))
    return
  }

  const data = await res.json()
  const b64 = data.predictions?.[0]?.bytesBase64Encoded
  if (!b64) {
    console.error(`❌ ${filename} 無回傳圖片`)
    return
  }

  fs.writeFileSync(outPath, Buffer.from(b64, 'base64'))
  console.log(`✅ ${filename} → public/images/profile/${filename}.png`)
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function main() {
  const entries = Object.entries(PROMPTS)
  console.log(`\n🚀 開始生成個人資訊選項圖片（漫畫風），共 ${entries.length} 張\n`)

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
