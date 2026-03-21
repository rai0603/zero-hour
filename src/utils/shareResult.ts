import html2canvas from 'html2canvas'

const APP_URL = 'https://zero-hour-d4d.pages.dev'

// 只有手機才用 Web Share API（桌機的系統分享面板不含 Facebook/IG）
const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

export async function captureCard(element: HTMLElement, filename: string): Promise<{ blob: Blob; file: File }> {
  const canvas = await html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    backgroundColor: null,
    logging: false,
  })

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(b => b ? resolve(b) : reject(new Error('Canvas toBlob failed')), 'image/png')
  })

  const file = new File([blob], filename, { type: 'image/png' })
  return { blob, file }
}

// 系統原生分享（LINE / IG / 更多）
export async function shareNative(element: HTMLElement, grade: string, score: number): Promise<void> {
  const { file } = await captureCard(element, `zerohour-${grade}-${score}.png`)
  const text = `我在零時生存的備災等級是 ${grade}（${score}/500 分）！你呢？\n${APP_URL}`

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: '零時生存 ZERO HOUR', text })
  } else {
    await downloadBlob(await captureCard(element, `zerohour-${grade}-${score}.png`).then(r => r.blob), `zerohour-${grade}-${score}.png`)
  }
}

// 分享到 Facebook（手機用 Web Share API；桌機下載圖片 + 開 Facebook）
export async function shareToFacebook(element: HTMLElement, grade: string, score: number): Promise<'shared' | 'downloaded'> {
  const { file } = await captureCard(element, `zerohour-${grade}-${score}.png`)
  const text = `我在零時生存的備災等級是 ${grade}（${score}/500 分）！來測試你的應變能力👇\n${APP_URL}`

  if (isMobile && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: '零時生存 ZERO HOUR', text })
    return 'shared'
  } else {
    // 桌機：用 Facebook Share Dialog（帶分享連結 + 預填文字）
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(APP_URL)}&quote=${encodeURIComponent(text)}`
    window.open(fbUrl, '_blank', 'width=600,height=500,noopener')
    return 'shared'
  }
}

// 分享到 Instagram（手機用 Web Share API；桌機只能下載圖片）
export async function shareToInstagram(element: HTMLElement, grade: string, score: number): Promise<'shared' | 'downloaded'> {
  const { file, blob } = await captureCard(element, `zerohour-${grade}-${score}.png`)
  const text = `我在零時生存的備災等級是 ${grade}（${score}/500 分）！來測試你的應變能力👇\n${APP_URL}`

  if (isMobile && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: '零時生存 ZERO HOUR', text })
    return 'shared'
  } else {
    await downloadBlob(blob, `zerohour-${grade}-${score}.png`)
    return 'downloaded'
  }
}

// 分享邀請卡
export async function shareInvite(element: HTMLElement): Promise<'shared' | 'downloaded'> {
  const { file, blob } = await captureCard(element, 'zerohour-invite.png')
  const text = `你準備好面對災難了嗎？來測試你的台灣災難應變能力！\n${APP_URL}`

  if (isMobile && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: '零時生存 ZERO HOUR', text })
    return 'shared'
  } else {
    await downloadBlob(blob, 'zerohour-invite.png')
    return 'downloaded'
  }
}

export async function downloadCard(element: HTMLElement, grade: string, score: number): Promise<void> {
  const { blob } = await captureCard(element, `zerohour-${grade}-${score}.png`)
  await downloadBlob(blob, `zerohour-${grade}-${score}.png`)
}

export async function shareToThreads(grade: string, score: number): Promise<void> {
  const text = encodeURIComponent(`我在零時生存的備災等級是 ${grade}（${score}/500 分）！來測試你的應變能力👇 ${APP_URL}`)
  window.open(`https://www.threads.net/intent/post?text=${text}`, '_blank', 'width=600,height=500,noopener')
}

export function copyLink(grade: string, score: number): Promise<void> {
  const text = `我在零時生存的備災等級是 ${grade}（${score}/500 分）！來測試你的應變能力👇\n${APP_URL}`
  return navigator.clipboard.writeText(text)
}

function downloadBlob(blob: Blob, filename: string): Promise<void> {
  return new Promise(resolve => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    resolve()
  })
}
