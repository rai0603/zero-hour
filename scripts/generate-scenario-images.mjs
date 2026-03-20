import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const API_KEY = 'AIzaSyBaYEStSRPP8OSBA0iO_8eQlfSV5_gLMqc'
const OUT_DIR = path.join(__dirname, '../public/images/scenarios')
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${API_KEY}`

const scenarios = [
  {
    file: 's1',
    prompt: 'Devastating magnitude 7.2 earthquake in a dense Taiwanese city at night, collapsed concrete apartment buildings, rubble and debris filling the streets, thick dust clouds, emergency lights flickering, broken glass everywhere, dramatic cinematic photography, dark moody atmosphere, photorealistic, 16:9',
  },
  {
    file: 's2',
    prompt: 'Massive tsunami wave 30 meters tall approaching a Taiwanese coastal city, people running in panic on the streets, emergency sirens, cars and buildings being swept away, dark stormy sky, dramatic cinematic photography, photorealistic, horrifying scale, 16:9',
  },
  {
    file: 's3',
    prompt: 'Military conflict in Taiwan, missile explosions lighting up the night sky over a city skyline, fighter jets, anti-aircraft fire, civilians seeking shelter, smoke and fire, emergency alert sirens, dramatic war photography, photorealistic, cinematic, 16:9',
  },
  {
    file: 's4',
    prompt: 'Super typhoon devastating Taiwan, extreme flooding in city streets, cars submerged, mudslide destroying mountain road, violent storm with horizontal rain, fallen trees and power lines, dark apocalyptic sky, dramatic photorealistic photography, 16:9',
  },
  {
    file: 's5',
    prompt: 'Terrorist attack explosion in a crowded Taiwanese subway station or shopping mall, fire and thick black smoke, panicking crowd running, emergency responders, debris and shattered glass, dramatic emergency photography, cinematic lighting, photorealistic, 16:9',
  },
  {
    file: 's6',
    prompt: 'Pandemic outbreak in Taiwan, completely empty quarantined city streets, people in hazmat suits and gas masks, police blockades, biohazard warning signs, eerie yellow-green foggy atmosphere, abandoned storefronts, dramatic cinematic photography, photorealistic, 16:9',
  },
  {
    file: 's7',
    prompt: 'Unknown creature attack in Taiwan, massive mysterious creature silhouette emerging from dark ocean near city coast, panic in the streets, military response, glowing eyes in darkness, dramatic kaiju-like cinematic photography, dark atmospheric, photorealistic style, 16:9',
  },
]

async function generateImage(prompt) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: '16:9',
        outputOptions: { mimeType: 'image/jpeg' },
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

  for (const { file, prompt } of scenarios) {
    const outPath = path.join(OUT_DIR, `${file}.jpg`)
    if (fs.existsSync(outPath)) {
      console.log(`⏭  skip  ${file}.jpg`)
      continue
    }
    try {
      process.stdout.write(`⏳ generating ${file}...`)
      const buf = await generateImage(prompt)
      fs.writeFileSync(outPath, buf)
      console.log(` ✅ saved (${Math.round(buf.length / 1024)}KB)`)
    } catch (e) {
      console.log(` ❌ ${e.message.slice(0, 120)}`)
    }
    await new Promise(r => setTimeout(r, 8000)) // imagen-4.0 rate limit: ~8 RPM
  }

  console.log('\n🎉 done!')
}

main()
