import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const API_KEY = 'AIzaSyBaYEStSRPP8OSBA0iO_8eQlfSV5_gLMqc'
const OUT_DIR = path.join(__dirname, '../public/images/profile')
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${API_KEY}`

const STYLE = 'flat icon, dark brown-black background, orange amber color #c8861a, disaster survival game UI, minimalist, no text, square format'

const icons = [
  // gender
  { file: 'gender_male',    prompt: `male gender symbol, circle with arrow pointing upper-right, ${STYLE}` },
  { file: 'gender_female',  prompt: `female gender symbol, circle with cross below, ${STYLE}` },
  { file: 'gender_other',   prompt: `gender neutral symbol, circle with question mark, ${STYLE}` },

  // ageGroup
  { file: 'ageGroup_under18', prompt: `young person silhouette, small figure, youth icon, ${STYLE}` },
  { file: 'ageGroup_18-35',   prompt: `young adult person silhouette, standing figure, ${STYLE}` },
  { file: 'ageGroup_36-55',   prompt: `middle aged adult person silhouette, ${STYLE}` },
  { file: 'ageGroup_over56',  prompt: `elderly person silhouette with walking cane, senior icon, ${STYLE}` },

  // location
  { file: 'location_urban',    prompt: `city skyline with tall buildings, urban icon, ${STYLE}` },
  { file: 'location_suburban', prompt: `suburban house with small trees, residential neighborhood icon, ${STYLE}` },
  { file: 'location_rural',    prompt: `farmhouse barn with wheat field, rural countryside icon, ${STYLE}` },
  { file: 'location_mountain', prompt: `mountain peak with snow cap, highland terrain icon, ${STYLE}` },
  { file: 'location_coastal',  prompt: `ocean waves with lighthouse, coastal seaside icon, ${STYLE}` },
  { file: 'location_island',   prompt: `small island with palm tree surrounded by water, ${STYLE}` },

  // companions
  { file: 'companions_alone',    prompt: `single person silhouette standing alone, solitary figure icon, ${STYLE}` },
  { file: 'companions_partner',  prompt: `two adult person silhouettes side by side, couple icon, ${STYLE}` },
  { file: 'companions_children', prompt: `adult with small child silhouettes, parent and child icon, ${STYLE}` },
  { file: 'companions_elderly',  prompt: `elderly person with cane silhouette, senior family member icon, ${STYLE}` },
  { file: 'companions_roommate', prompt: `three person silhouettes together, roommates group icon, ${STYLE}` },
  { file: 'companions_pet',      prompt: `dog silhouette, pet animal icon, ${STYLE}` },

  // vehicles
  { file: 'vehicles_none',       prompt: `bus stop sign with X, no vehicle public transport icon, ${STYLE}` },
  { file: 'vehicles_motorcycle', prompt: `motorcycle side view silhouette, motorbike icon, ${STYLE}` },
  { file: 'vehicles_car',        prompt: `sedan car side view silhouette, automobile icon, ${STYLE}` },
  { file: 'vehicles_truck',      prompt: `pickup truck or van side view silhouette, cargo vehicle icon, ${STYLE}` },
  { file: 'vehicles_bicycle',    prompt: `bicycle side view silhouette, bike icon, ${STYLE}` },
  { file: 'vehicles_ev',         prompt: `electric car with lightning bolt charging symbol, EV icon, ${STYLE}` },

  // supplies
  { file: 'supplies_firstAidKit',    prompt: `first aid kit box with red cross, medical emergency kit icon, ${STYLE}` },
  { file: 'supplies_emergencyFood',  prompt: `canned food and dry rations, emergency food supply icon, ${STYLE}` },
  { file: 'supplies_waterStorage',   prompt: `water container jug with water droplet, water storage icon, ${STYLE}` },
  { file: 'supplies_flashlight',     prompt: `flashlight with light beam, torch icon, ${STYLE}` },
  { file: 'supplies_none',           prompt: `empty box with X cross, no supplies icon, ${STYLE}` },
  { file: 'supplies_fullKit72h',     prompt: `survival backpack with gear, 72-hour emergency kit bag icon, ${STYLE}` },

  // healthStatus
  { file: 'healthStatus_healthy',   prompt: `heart with checkmark, healthy person icon, ${STYLE}` },
  { file: 'healthStatus_chronic',   prompt: `pill capsule with medical cross, chronic medication icon, ${STYLE}` },
  { file: 'healthStatus_mobility',  prompt: `wheelchair symbol, mobility impairment icon, ${STYLE}` },
  { file: 'healthStatus_pregnant',  prompt: `pregnant woman silhouette profile, maternity icon, ${STYLE}` },

  // occupation
  { file: 'occupation_general',     prompt: `briefcase with office building, office worker icon, ${STYLE}` },
  { file: 'occupation_medical',     prompt: `stethoscope medical symbol, doctor nurse healthcare icon, ${STYLE}` },
  { file: 'occupation_military',    prompt: `military badge shield with star, soldier firefighter icon, ${STYLE}` },
  { file: 'occupation_agriculture', prompt: `wheat stalks with tractor, farmer agriculture icon, ${STYLE}` },
  { file: 'occupation_service',     prompt: `apron with service bell, food service retail worker icon, ${STYLE}` },
  { file: 'occupation_other',       prompt: `question mark in circle, other occupation icon, ${STYLE}` },

  // selfRatedKnowledge
  { file: 'selfRatedKnowledge_none',    prompt: `closed book with X, no knowledge icon, ${STYLE}` },
  { file: 'selfRatedKnowledge_basic',   prompt: `open book with bookmark, basic knowledge icon, ${STYLE}` },
  { file: 'selfRatedKnowledge_drill',   prompt: `shield with checkmark, safety drill training icon, ${STYLE}` },
  { file: 'selfRatedKnowledge_trained', prompt: `medal star with laurel wreath, expert trained skill icon, ${STYLE}` },
]

async function generateImage(prompt) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: '1:1',
        outputOptions: { mimeType: 'image/png' },
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API error ${res.status}: ${err}`)
  }

  const json = await res.json()
  const b64 = json.predictions?.[0]?.bytesBase64Encoded
  if (!b64) throw new Error(`No image in response: ${JSON.stringify(json)}`)
  return Buffer.from(b64, 'base64')
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  for (const { file, prompt } of icons) {
    const outPath = path.join(OUT_DIR, `${file}.png`)
    if (fs.existsSync(outPath)) {
      console.log(`⏭  skip  ${file}.png`)
      continue
    }
    try {
      process.stdout.write(`⏳ generating ${file}...`)
      const buf = await generateImage(prompt)
      fs.writeFileSync(outPath, buf)
      console.log(` ✅ saved (${Math.round(buf.length / 1024)}KB)`)
    } catch (e) {
      console.log(` ❌ ${e.message}`)
    }
    // 避免超過 API rate limit
    await new Promise(r => setTimeout(r, 500))
  }

  console.log('\n🎉 done!')
}

main()
