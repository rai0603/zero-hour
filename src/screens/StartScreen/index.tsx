import { useEffect, useRef } from 'react'
import { useGameStore } from '../../store/gameStore'
import { useAuth } from '../../contexts/AuthContext'

function DustParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.4,
      dx: (Math.random() - 0.5) * 0.3,
      dy: -(Math.random() * 0.6 + 0.2),
      alpha: Math.random() * 0.5 + 0.15,
    }))

    let animId: number
    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(180, 140, 80, ${p.alpha})`
        ctx.fill()
        p.x += p.dx
        p.y += p.dy
        if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width }
        if (p.x < -5) p.x = canvas.width + 5
        if (p.x > canvas.width + 5) p.x = -5
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
}

export default function StartScreen() {
  const startGame = useGameStore(s => s.startGame)
  const goToWishPool = useGameStore(s => s.goToWishPool)
  const goToAccount = useGameStore(s => s.goToAccount)
  const { user } = useAuth()

  return (
    <div className="relative min-h-screen bg-gradient-dark flex flex-col items-center justify-center px-4 py-8 vignette overflow-hidden">
      <DustParticles />

      {/* 右上角會員按鈕 */}
      <button
        onClick={goToAccount}
        className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-white/10 text-xs font-bold transition-colors"
        style={{ color: 'hsl(35, 20%, 70%)' }}
      >
        {user ? (
          <>
            <span className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-black">
              {user.email?.[0].toUpperCase()}
            </span>
            我的帳號
          </>
        ) : (
          <>👤 登入</>
        )}
      </button>

      <div className="relative z-10 flex flex-col items-center max-w-lg w-full space-y-8 animate-slide-up">

        {/* 警告圖示 */}
        <div className="animate-flicker">
          <img
            src="/warning-icon.png"
            alt="Warning"
            className="w-24 h-24 md:w-28 md:h-28"
            style={{ filter: 'drop-shadow(0 0 20px hsl(25 90% 50% / 0.5))' }}
          />
        </div>

        {/* 標題區 */}
        <div className="text-center space-y-2">
          <h1
            className="text-5xl md:text-7xl tracking-wider"
            style={{
              fontFamily: "'Noto Serif SC', serif",
              fontWeight: 900,
              color: 'hsl(35, 20%, 80%)',
              textShadow: '0 0 30px hsl(25 90% 50% / 0.3), 0 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            零時生存
          </h1>
          <p
            className="text-lg md:text-xl tracking-[0.4em] text-rust"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            ZERO HOUR
          </p>
          <p
            className="text-base md:text-lg tracking-wide"
            style={{ color: 'hsl(30, 10%, 50%)', fontFamily: "'Rajdhani', system-ui, sans-serif" }}
          >
            台灣災難應變能力情境測試
          </p>
        </div>

        {/* 任務簡報 */}
        <div
          className="w-full p-5 rounded relative overflow-hidden texture-scratched"
          style={{
            border: '1px solid hsl(25, 30%, 22%)',
            background: 'hsl(20, 12%, 12% / 0.8)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div className="hazard-tape absolute top-0 left-0 right-0" />
          <div className="mt-3 space-y-3">
            <p
              className="text-rust text-sm tracking-wider"
              style={{ fontFamily: "'Share Tech Mono', monospace" }}
            >
              // 任務簡報
            </p>
            <p
              className="text-base leading-relaxed"
              style={{ color: 'hsl(35, 20%, 80%)', fontFamily: "'Rajdhani', system-ui, sans-serif" }}
            >
              這是一場情境模擬測試，每個選擇都會影響你的存活機率。沒有唯一正確答案，但錯誤的決策可能是致命的。
            </p>
            <div
              className="flex flex-wrap gap-4 text-sm"
              style={{ color: 'hsl(30, 10%, 50%)', fontFamily: "'Rajdhani', system-ui, sans-serif" }}
            >
              <span>⏱ 約 15～30 分鐘</span>
              <span>🎯 7 大情境可選</span>
              <span>📱 手機優先</span>
            </div>
          </div>
        </div>

        {/* 按鈕區 */}
        <div className="w-full space-y-3">
          <button
            onClick={startGame}
            className="w-full h-16 rounded-md text-xl font-bold uppercase tracking-wider transition-all duration-200 hover:shadow-glow border animate-pulse-glow"
            style={{
              fontFamily: "'Rajdhani', system-ui, sans-serif",
              background: 'linear-gradient(to right, hsl(25, 90%, 50%), hsl(45, 95%, 55%))',
              color: 'hsl(20, 10%, 5%)',
              borderColor: 'hsl(25, 90%, 50% / 0.5)',
            }}
          >
            開始測試 ▶
          </button>

          <button
            onClick={goToWishPool}
            className="w-full h-14 rounded-md text-lg font-bold uppercase tracking-wider transition-all duration-200 bg-transparent hover:text-rust"
            style={{
              fontFamily: "'Rajdhani', system-ui, sans-serif",
              border: '2px solid hsl(25, 30%, 22%)',
              color: 'hsl(35, 20%, 80%)',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'hsl(25, 90%, 50%)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'hsl(25, 30%, 22%)')}
          >
            許願池
          </button>
        </div>

        <p
          className="text-xs tracking-wide text-center"
          style={{ color: 'hsl(30, 10%, 50%)', fontFamily: "'Rajdhani', system-ui, sans-serif" }}
        >
          建議 12 歲以上使用 · 內容含災難情境描述
        </p>
      </div>
    </div>
  )
}
