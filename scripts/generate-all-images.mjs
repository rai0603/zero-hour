/**
 * 零時生存 ZERO HOUR — 全情境專屬圖片生成（手工英文 prompt）
 * node scripts/generate-all-images.mjs S1
 * node scripts/generate-all-images.mjs S2
 * node scripts/generate-all-images.mjs S3
 * node scripts/generate-all-images.mjs S4
 * node scripts/generate-all-images.mjs S5
 * node scripts/generate-all-images.mjs S7
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

const STYLE = 'photorealistic documentary photography, natural lighting, modern Taiwan urban or rural setting, no text, no watermark'
const EQ = 'post-earthquake Taiwan urban scene, dust, debris, dark'
const WAR = 'wartime Taiwan, missile attack aftermath, cinematic dramatic lighting'
const TSUNAMI = 'tsunami evacuation Taiwan coastal town, urgent, dramatic'
const TYPHOON = 'super typhoon aftermath Taiwan, flooded streets, dramatic sky'
const TERROR = 'terrorism incident Taiwan public space, police perimeter, dramatic'
const CREATURE = 'giant unknown creature emergency Taiwan coast, sci-fi realistic, dramatic'

const ALL_PROMPTS = {

  // ─── S1 大地震 ───────────────────────────────────────────
  S1_Q001: `${EQ}. Person jolted awake in pitch-black bedroom, furniture knocked over, phone glowing on nightstand. ${STYLE}`,
  S1_Q002: `${EQ}. Dark damaged apartment interior after shaking stops, faint gas smell, person holding phone showing 70% battery, wall cracked. ${STYLE}`,
  S1_Q003: `${EQ}. Person pushing against warped jammed bedroom door with bent frame, wall cracks visible, trapped inside. ${STYLE}`,
  S1_Q004: `${EQ}. Family gathered in damaged apartment hallway, elevator indicator glowing with backup power, ceiling plaster fallen. ${STYLE}`,
  S1_Q005: `${EQ}. Ground floor lobby with shattered glass entrance, debris outside, people crying on street, cars hit by falling bricks. ${STYLE}`,
  S1_Q006: `${EQ}. Neighborhood park at night, 50+ earthquake survivors gathered, people on phones, distressed faces, Taiwan apartment buildings in background. ${STYLE}`,
  S1_Q007: `${EQ}. 7-story Taiwan apartment building exterior with visible structural cracks, person looking up at damage, rescue scene street level. ${STYLE}`,
  S1_Q008: `${EQ}. Emergency shelter sign on dark damaged Taiwan street at night, arrow pointing to direction. ${STYLE}`,
  S1_Q009: `${EQ}. Elementary school gymnasium turned emergency shelter, rows of people sitting on mats, one agitated man standing and shouting. ${STYLE}`,
  S1_Q010: `${EQ}. Emergency water distribution queue at shelter, people holding containers, limited supplies table. ${STYLE}`,
  S1_Q011: `${EQ}. Sick person lying on mat in earthquake shelter, pale face, feverish, vomit bag nearby, concerned people around. ${STYLE}`,
  S1_Q012: `${EQ}. Taiwan apartment building exterior with red condemnation notice posted on door, visible structural damage. ${STYLE}`,
  S1_Q013: `${EQ}. Earthquake shelter interior, people looking at official notice board showing two options, government vehicles outside window. ${STYLE}`,
  S1_Q014: `${EQ}. Earthquake-damaged apartment hallway, one door open revealing supplies inside, person peering in. ${STYLE}`,
  S1_Q002_B: `${EQ}. Person standing in dark apartment doorway with minor head cut, blood on forehead, broken glass on floor nearby. ${STYLE}`,
  S1_Q004_B: `${EQ}. Person gripping injured shoulder in pain in apartment hallway, family members around, door frame visibly warped. ${STYLE}`,
  S1_Q004_C: `${EQ}. Family waiting anxiously in dark apartment hallway, emergency phone screen visible, time has passed. ${STYLE}`,
  S1_Q005_C: `${EQ}. Elevator doors stuck open showing elderly person and child inside on floor 3, person pressing emergency button in lobby. ${STYLE}`,
  S1_Q006_B: `${EQ}. Person with bandaged arm crouching under building overhang after earthquake, park visible 200m away. ${STYLE}`,
  S1_Q006_C: `${EQ}. Person supporting injured elderly woman with leg injury on earthquake-damaged Taiwan street, helping her walk. ${STYLE}`,
  S1_Q007_B: `${EQ}. Person sitting in park at night scrolling phone after earthquake, battery draining, family nearby, worried expression. ${STYLE}`,
  S1_Q008_B: `${EQ}. Collapsed interior of damaged building, person pinned under debris, rescuers trying to help, dust in air. ${STYLE}`,
  S1_Q009_B: `${EQ}. Exhausted elderly woman at community center entrance being supported by family, barely able to stand. ${STYLE}`,
  S1_Q009_C: `${EQ}. Emotional reunion at elementary school shelter, person finding separated family member, relief on faces. ${STYLE}`,
  S1_Q010_C: `${EQ}. Tense confrontation at earthquake shelter, crowd gathering around argument, atmosphere deteriorating. ${STYLE}`,
  S1_Q011_C: `${EQ}. Person with possibly fractured arm being helped out of partially collapsed Taiwan supermarket, goods on floor. ${STYLE}`,
  S1_Q012_C: `${EQ}. Interior of cracked apartment building during aftershock, plaster and dust falling from ceiling, people crouching. ${STYLE}`,
  S1_Q013_B: `${EQ}. Person quickly exiting damaged building, clutching documents and medicine under arm, dust everywhere. ${STYLE}`,
  S1_Q013_C: `${EQ}. Group inside cracked Taiwan apartment during strong aftershock, ceiling debris falling, terrified faces. ${STYLE}`,
  S1_Q014_D: `${EQ}. Person in damaged apartment finally seeing signal on phone, relief and exhaustion on face, sunset through cracked window. ${STYLE}`,

  // ─── S2 海嘯 ────────────────────────────────────────────
  S2_Q001: `${TSUNAMI}. Families running away from beach on Taiwanese coast, tsunami warning sirens visible, beach tent and belongings left behind, 15-minute countdown urgency. ${STYLE}`,
  S2_Q002: `${TSUNAMI}. Chaotic coastal parking lot, cars trying to exit all at once, gridlock, people running on foot past cars, Taiwan coast. ${STYLE}`,
  S2_Q003: `${TSUNAMI}. Five-story hotel on Taiwan coastal road with open front doors, evacuation in progress, people running past. ${STYLE}`,
  S2_Q004: `${TSUNAMI}. View from 5th floor hotel window of massive brown floodwater surging through streets below, debris floating. ${STYLE}`,
  S2_Q005: `${TSUNAMI}. Taiwan coastal town devastation after tsunami, cars buried in mud and debris, damaged buildings, low-tide aftermath. ${STYLE}`,
  S2_Q006: `${TSUNAMI}. Tsunami debris field on coastal road, mixed garbage and floating sealed water bottles, survivors looking through it. ${STYLE}`,
  S2_Q002_B: `${TSUNAMI}. Person running back from beach toward parking lot carrying extra items, traffic jam ahead, coastal Taiwan. ${STYLE}`,
  S2_Q003_B: `${TSUNAMI}. Person running on foot along coastal road after abandoning car in gridlock, exhausted, 7 minutes to impact. ${STYLE}`,
  S2_Q003_C: `${TSUNAMI}. Car stuck in roadside mud during evacuation attempt, driver looking frustrated, coastal Taiwan. ${STYLE}`,
  S2_Q004_B: `${TSUNAMI}. Family members in ankle-deep fast-moving water on hillside, struggling to stay upright, supporting each other. ${STYLE}`,
  S2_Q004_C: `${TSUNAMI}. Split view - some family on hotel balcony, others waving from hilltop far away, separated during tsunami. ${STYLE}`,
  S2_Q006_B: `${TSUNAMI}. Pickup truck on tsunami-damaged road, cracked bridge visible ahead, driver looking uncertain. ${STYLE}`,
  S2_Q006_C: `${TSUNAMI}. Exhausted family group walking on debris-covered tsunami road, elderly person struggling, long road ahead. ${STYLE}`,
  S2_Q007_B: `${TSUNAMI}. Person drinking from sealed water bottle found in tsunami debris, uncertain expression, others watching. ${STYLE}`,
  S2_Q007_C: `${TSUNAMI}. Person boiling flood water using cloth filter over small fire, improvised survival at coastal evacuation point. ${STYLE}`,
  S2_Q007: `${TSUNAMI}. Official relief bus at coastal Taiwan town, tsunami survivors queuing to board, only 15 of 35 can fit. ${STYLE}`,

  // ─── S3 台海軍事衝突 ────────────────────────────────────
  S3_Q001: `${WAR}. Taiwanese person jolted awake at 2:47AM by missile alert on phone, dark 6th floor apartment, city lights going out through window. ${STYLE}`,
  S3_Q002: `${WAR}. Couple huddled together in apartment bathroom during missile explosions outside, one person trembling, phone with weak signal. ${STYLE}`,
  S3_Q003: `${WAR}. Small table with limited survival supplies: 4 water bottles, instant noodles, crackers, flashlight, first aid kit in dark Taiwan apartment. ${STYLE}`,
  S3_Q004: `${WAR}. Dark Taiwan apartment building hallway, multiple households gathering by candlelight after power cut, 7 people in wartime. ${STYLE}`,
  S3_Q005: `${WAR}. Person looking through apartment door peephole at suspicious silhouettes in dark hallway during wartime. ${STYLE}`,
  S3_Q006: `${WAR}. Small group in apartment hallway, elderly man (65) holding empty medication bottle, worried neighbors around him. ${STYLE}`,
  S3_Q007: `${WAR}. Apartment bathroom with dry faucet, multiple containers collecting residual water, emergency water conservation Taiwan. ${STYLE}`,
  S3_Q008: `${WAR}. Person speaking through closed apartment door to suspicious man in hallway claiming to be civil defense, handwritten ID shown. ${STYLE}`,
  S3_Q009: `${WAR}. Group of residents with emergency bags at apartment building entrance, debating evacuation, damaged Taiwan street visible. ${STYLE}`,
  S3_Q010: `${WAR}. Emergency go-bag being assembled on apartment floor: first aid kit, flashlight, phone charger, water, food, documents. ${STYLE}`,
  S3_Q011: `${WAR}. Taiwan street in wartime, ROC Army soldier in camouflage directing civilians urgently into building, distant gunfire, people running. ${STYLE}`,
  S3_Q012: `${WAR}. Elementary school courtyard turned military assembly point, 200+ civilians waiting under military tents at night, soldiers present. ${STYLE}`,
  S3_Q013: `${WAR}. Night at assembly point, suspicious man approaching civilian with covert offer, secretive conversation body language. ${STYLE}`,
  S3_Q014: `${WAR}. Civilians at assembly point hearing Mandarin propaganda broadcast from loudspeakers, confused and worried expressions. ${STYLE}`,
  S3_Q015: `${WAR}. Military evacuation loading point, civilians only allowed small backpacks, soldiers directing, large luggage being left behind. ${STYLE}`,
  S3_Q016: `${WAR}. Military convoy stopped at overturned armored vehicle roadblock on Taiwan road, civilians waiting in abandoned factory interior. ${STYLE}`,
  S3_Q017: `${WAR}. Crowded military transit facility with 800 displaced civilians, temporary shelter structures, queues for supplies. ${STYLE}`,
  S3_Q018: `${WAR}. Suspicious man at temporary shelter approaching civilians, making recruitment pitch, armed group implication. ${STYLE}`,
  S3_Q019: `${WAR}. Temporary shelter filled with people reacting to ceasefire news announcement, mixed emotions of relief and disbelief. ${STYLE}`,
  S3_Q020: `${WAR}. Military escorting civilians back to damaged Taipei neighborhood in vehicles, assessment crews inspecting buildings. ${STYLE}`,
  S3_Q002_B: `${WAR}. Person in apartment doorway with minor arm cut from shattered window glass, explosions continuing outside in darkness. ${STYLE}`,
  S3_Q002_C: `${WAR}. Person in living room bleeding from arm hit by exploding window glass, partner rushing over in wartime Taiwan apartment. ${STYLE}`,
  S3_Q003_B: `${WAR}. Person in dark apartment repeatedly dialing phone with no connection, battery indicator low, wartime stress. ${STYLE}`,
  S3_Q003_C: `${WAR}. Person overwhelmed scrolling misinformation on phone in dark apartment, panicked expression, battery draining. ${STYLE}`,
  S3_Q003_D: `${WAR}. Person lying flat beside a car on Taiwan street during second missile attack, smoke in distance, terrified. ${STYLE}`,
  S3_Q004_A: `${WAR}. Person returning to apartment with armful of supplies from convenience store, passing scared neighbors on stairs. ${STYLE}`,
  S3_Q004_C: `${WAR}. Person looking at empty kitchen shelves in dark apartment on day 2 of wartime food shortage, stomach growling. ${STYLE}`,
  S3_Q004_D: `${WAR}. Person on long phone call in dark wartime apartment, battery critically low, no food prepared, anxious. ${STYLE}`,
  S3_Q004_E: `${WAR}. Car stopped at military checkpoint on Taiwan road, armed ROC soldier approaching driver window, road blocked. ${STYLE}`,
  S3_Q005_B: `${WAR}. Person with completely dead phone in dark wartime apartment, neighbor knocking on door with news. ${STYLE}`,
  S3_Q006_B: `${WAR}. Tense confrontation in apartment corridor, one person emotionally unstable shouting, other residents trying to de-escalate. ${STYLE}`,
  S3_Q007_A: `${WAR}. Person facing completely empty pharmacy shelves in wartime Taiwan, everything cleared out, hands on empty shelf. ${STYLE}`,
  S3_Q008_B: `${WAR}. Taiwanese civilian being stopped by police officer on street while carrying water containers from park, wartime. ${STYLE}`,
  S3_Q008_C: `${WAR}. Government water distribution truck parked in Taiwan residential area, civilians with buckets and bottles queuing. ${STYLE}`,
  S3_Q009_C: `${WAR}. Suspicious man using open apartment door to scan interior, resident partially visible, wartime threat. ${STYLE}`,
  S3_Q010_A: `${WAR}. Exhausted civilians resting at elementary school assembly point after 8-hour wait, soldiers and tents around. ${STYLE}`,
  S3_Q010_C: `${WAR}. Small group watching from apartment window as last evacuation vehicles depart, trapped behind closed evacuation window. ${STYLE}`,
  S3_Q010_D: `${WAR}. Two people alone in bare apartment, others have evacuated, isolated and uncertain in wartime Taiwan. ${STYLE}`,
  S3_Q011_B: `${WAR}. Person with massively overstuffed backpack sitting on wartime Taiwan road, blisters on feet, exhausted. ${STYLE}`,
  S3_Q011_C: `${WAR}. Person huddled alone at military assembly point without food or supplies, cold night, shivering, 12 degrees Celsius. ${STYLE}`,
  S3_Q012_B: `${WAR}. Person ducking into shuttered shop doorway on Taiwan street during distant gunfire, wartime street scene. ${STYLE}`,
  S3_Q012_C: `${WAR}. Civilians encountering abandoned military roadblock vehicle on Taiwan road, scattered equipment, no personnel present. ${STYLE}`,
  S3_Q013_B: `${WAR}. Sick person on mat at military assembly point, delayed treatment, medicine bottles nearby, pale and weak. ${STYLE}`,
  S3_Q013_C: `${WAR}. Military personnel conducting trust interview with civilian group at assembly point, stern expressions, documents checked. ${STYLE}`,
  S3_Q014_D: `${WAR}. Suspicious person surrounded by growing undecided crowd at assembly point, pressure and peer influence scene. ${STYLE}`,
  S3_Q015_B: `${WAR}. Civilian apologizing to military officer at assembly point, honest cooperative expression, officer with clipboard. ${STYLE}`,
  S3_Q015_C: `${WAR}. Civilian detained by wartime military patrol on Taiwan street, hands raised, explaining themselves. ${STYLE}`,
  S3_Q016_B: `${WAR}. Person rushing aboard military evacuation vehicle at very last moment, some belongings dropped on ground. ${STYLE}`,
  S3_Q017_B: `${WAR}. Person confronting suspicious man on phone in abandoned factory, man startled and turning to flee. ${STYLE}`,
  S3_Q017_C: `${WAR}. Suspicious man completing secretive phone call in factory corner, walking away, observer watching from distance. ${STYLE}`,
  S3_Q018_B: `${WAR}. Civilian at wartime relief distribution table without registration documents, worker pointing to registration desk. ${STYLE}`,
  S3_Q018_C: `${WAR}. Shady person making suspicious quick-cash offer to civilian at wartime transit facility, money implication. ${STYLE}`,
  S3_Q019_B: `${WAR}. Injured civilian returning to group at shelter with leg bandage, others looking worried and concerned. ${STYLE}`,
  S3_Q019_C: `${WAR}. Military officers conducting formal investigation interview with civilian group at wartime shelter, documents and IDs. ${STYLE}`,
  S3_Q020_C: `${WAR}. Civilian at military base desk requesting permission to leave during ceasefire, officer reviewing regulations. ${STYLE}`,
  S3_Q020_D: `${WAR}. Civilians in temporary shelter, just celebrated ceasefire now suddenly alarmed as explosions resume in distance. ${STYLE}`,

  // ─── S4 颱風 ────────────────────────────────────────────
  S4_Q001: `${TYPHOON}. Taiwanese family checking food supplies and water storage at home, 48 hours before typhoon landfall, normal apartment. ${STYLE}`,
  S4_Q002: `${TYPHOON}. Taiwan city street with shop owners boarding up windows, heavy overcast sky, typhoon warning broadcast on TV visible through window. ${STYLE}`,
  S4_Q003: `${TYPHOON}. Taiwan apartment ground floor with rising floodwater reaching knee height, person deciding next move, wind howling outside. ${STYLE}`,
  S4_Q004: `${TYPHOON}. Typhoon eye passing — suddenly calm blue sky through window after violent storm, children looking out in amazement. ${STYLE}`,
  S4_Q005: `${TYPHOON}. Taiwan apartment ground floor after typhoon, thick brown mud and debris coating entire floor, murky contaminated water. ${STYLE}`,
  S4_Q002_B: `${TYPHOON}. Nearly empty supermarket shelves in Taiwan, only a few items left, last-minute typhoon shoppers, bottled water aisle bare. ${STYLE}`,
  S4_Q003_C: `${TYPHOON}. Person struggling to close door against typhoon-force winds, door blown violently open, horizontal rain outside. ${STYLE}`,
  S4_Q004_B: `${TYPHOON}. Person wading waist-deep in apartment floodwater rushing to switch off electrical panel before evacuating upstairs. ${STYLE}`,
  S4_Q005_B: `${TYPHOON}. Taiwan family member with arm cut from flying debris outside after typhoon, being bandaged, still windy outside. ${STYLE}`,
  S4_Q005_C: `${TYPHOON}. Person bent over fighting against sudden violent typhoon wind gust on Taiwan street, nearly knocked over. ${STYLE}`,
  S4_Q006: `${TYPHOON}. Downed live power line lying in flooded Taiwan alley after typhoon, danger, electricity sparking in water. ${STYLE}`,
  S4_Q007: `${TYPHOON}. Open refrigerator after 8+ hour power outage, raw meat and dairy products at risk, person inspecting with uncertain look. ${STYLE}`,
  S4_Q008: `${TYPHOON}. Person climbing stairs in typhoon-damaged Taiwan apartment building, checking floors, looking for elderly neighbor. ${STYLE}`,
  S4_Q009: `${TYPHOON}. Flooded muddy Taiwan alley after typhoon, downed electrical wires visible, damaged motorcycles tipped over. ${STYLE}`,
  S4_Q010: `${TYPHOON}. Person filling out disaster relief assistance form on computer, damaged Taiwan apartment visible in background. ${STYLE}`,
  S4_Q011: `Taiwanese person organizing emergency preparedness kit on living room floor: large water containers, canned food, flashlights, first aid kit, planning for next typhoon. ${STYLE}`,

  // ─── S5 恐攻 ────────────────────────────────────────────
  S5_Q001: `${TERROR}. Taiwan department store B1 food court, explosion aftermath with smoke, people diving under tables, panic, overturned chairs. ${STYLE}`,
  S5_Q002: `${TERROR}. Taiwan department store multiple emergency exits visible, panicked crowd splitting different directions, emergency lights flashing. ${STYLE}`,
  S5_Q002_B: `${TERROR}. Person fallen on shopping mall floor during stampede, broken phone beside them, crowd running past, chaotic. ${STYLE}`,
  S5_Q002_C: `${TERROR}. Person with minor arm bleeding from explosion debris at mall B1, holding wound, second explosion happening. ${STYLE}`,
  S5_Q003: `${TERROR}. Crowd streaming out of Taiwan department store onto street, police setting up barrier tape, one person with crutch or limping badly. ${STYLE}`,
  S5_Q003_B: `${TERROR}. Dense crowd pushing through Taiwan department store main entrance, person with injured ankle grimacing in the crush. ${STYLE}`,
  S5_Q003_C: `${TERROR}. Dead-end corridor in Taiwan shopping mall, locked damaged emergency exit, people in panic pushing against it, screaming. ${STYLE}`,
  S5_Q004: `${TERROR}. Police interviewing witnesses on Taiwan street outside bombed mall, journalist approaching civilian with microphone. ${STYLE}`,
  S5_Q004_B: `${TERROR}. Person anxiously searching through post-explosion street chaos outside Taiwan mall for a missing friend. ${STYLE}`,
  S5_Q004_C: `${TERROR}. Person with bandaged ankle being formally questioned at police perimeter after Taiwan bombing incident. ${STYLE}`,
  S5_Q005: `${TERROR}. Police perimeter outside bombed Taiwan department store, forensic teams working, civilians being processed out. ${STYLE}`,
  S5_Q005_B: `${TERROR}. Person overwhelmed by multiple incoming calls on phone at 20% battery, media and cameras visible outside Taiwan bombing site. ${STYLE}`,
  S5_Q005_C: `${TERROR}. Multiple journalists and cameras surrounding distressed person on Taiwan street after bombing, invasive press scene. ${STYLE}`,
  S5_Q006: `${TERROR}. Person lying awake in dark bedroom at night, staring at ceiling, haunted expression, phone with news notifications, PTSD aftermath. ${STYLE}`,
  S5_Q007: `Calm, warm psychological counseling room in Taiwan, therapist and patient in first trauma counseling session, soft lighting, safe space. ${STYLE}`,

  // ─── S7 不明生物 ────────────────────────────────────────
  S7_Q001: `${CREATURE}. Person on Yilan coastal walking path, massive unknown creature silhouette visible in ocean distance, coastal plants violently shaking, emergency alert on phone screen. ${STYLE}`,
  S7_Q002: `${CREATURE}. Yilan coastal parking lot in chaos, cars trying to exit simultaneously, people running on foot, deep rumbling sound from beach direction. ${STYLE}`,
  S7_Q003: `${CREATURE}. Taiwan coastal town evacuation chaos, backed-up traffic on road, people on foot and in cars, enormous creature movement visible in far distance. ${STYLE}`,
  S7_Q003_B: `${CREATURE}. Person walking alone on empty road 5km from coast, exhausted, checking phone update about creature changing direction. ${STYLE}`,
  S7_Q003_C: `${CREATURE}. Person crawling out from under car in parking lot, realizing the hiding spot is completely useless, enormous creature nearby. ${STYLE}`,
  S7_Q003_D: `${CREATURE}. Person standing on small hilltop overlooking coastal Taiwan town, watching enormous creature silhouette in distance below. ${STYLE}`,
  S7_Q004: `${CREATURE}. Large sports gymnasium emergency evacuation shelter, 500+ scared evacuees, scuffle at supply distribution tables, crowded. ${STYLE}`,
  S7_Q004_B: `${CREATURE}. Person completely alone on unfamiliar back road in Taiwan countryside, no phone signal, disoriented and scared. ${STYLE}`,
  S7_Q004_C: `${CREATURE}. Official evacuation worker checking on person hiding inside Taiwan building, informing them the shelter location has changed. ${STYLE}`,
  S7_Q005: `${CREATURE}. Government press conference screens showing military operation against deep-sea creature, officials announcing threat neutralized. ${STYLE}`,
  S7_Q005_B: `${CREATURE}. Person intensely spreading rumors in crowded evacuation shelter, large group gathering around, shelter staff intervening urgently. ${STYLE}`,
  S7_Q006: `${CREATURE}. Evacuation shelter, adult looking at injured child (not their own) with protective concern, deciding whether to take responsibility. ${STYLE}`,
  S7_Q007: `Person returning home to intact Taiwan house with minor exterior wall cracks from creature ground vibrations, inspecting cracks up close, relief on face. ${STYLE}`,
}

const SCENARIO_DIRS = {
  S1: 's1', S2: 's2', S3: 's3', S4: 's4', S5: 's5', S7: 's7',
}

async function generateImage(questionId, prompt, scenarioId) {
  const dir = path.join(ROOT, 'public/images', SCENARIO_DIRS[scenarioId])
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
  if (!b64) { console.error(`❌ ${questionId} 無回傳圖片`); return }

  fs.writeFileSync(outPath, Buffer.from(b64, 'base64'))
  console.log(`✅ ${questionId} → public/images/${SCENARIO_DIRS[scenarioId]}/${questionId}.png`)
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  const arg = process.argv[2]?.toUpperCase()
  if (!arg || !SCENARIO_DIRS[arg]) {
    console.error('用法：node scripts/generate-all-images.mjs S1|S2|S3|S4|S5|S7')
    process.exit(1)
  }

  const entries = Object.entries(ALL_PROMPTS).filter(([id]) => id.startsWith(arg + '_'))
  console.log(`\n🚀 開始生成 ${arg}，共 ${entries.length} 張\n`)

  for (let i = 0; i < entries.length; i++) {
    const [id, prompt] = entries[i]
    await generateImage(id, prompt, arg)
    if (i < entries.length - 1) await sleep(DELAY_MS)
  }

  console.log('\n🎉 完成！')
}

main().catch(err => { console.error('腳本錯誤：', err); process.exit(1) })
