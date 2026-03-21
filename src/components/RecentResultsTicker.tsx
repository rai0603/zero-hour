import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

interface TickerRow {
  id: string
  display_name: string | null
  scenario_id: string
  grade: string
  score: number
  country: string | null
  avatar_url: string | null
  created_at: string
}

const scenarioNames: Record<string, string> = {
  S1: '大地震', S2: '海嘯警報', S3: '戰爭衝突',
  S4: '異常天候', S5: '恐怖攻擊', S6: '疫情感染', S7: '不明生物',
}

const gradeColors: Record<string, string> = {
  S: '#eab308', A: '#22c55e', B: '#3b82f6',
  C: '#f97316', D: '#ef4444', F: '#6b7280',
}

function countryFlag(code: string) {
  if (!code || code.length !== 2) return '🌐'
  return code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)))
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return '剛剛'
  if (diff < 3600) return `${Math.floor(diff / 60)} 分前`
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小時前`
  return `${Math.floor(diff / 86400)} 天前`
}

const CACHE_KEY = 'zh_ticker_cache'
const CACHE_TTL = 24 * 60 * 60 * 1000
const ITEM_H = 60 // px per row
const VISIBLE = 2

async function fetchRecent(): Promise<TickerRow[]> {
  const { data } = await supabase
    .from('zerohour_results')
    .select('id, display_name, scenario_id, grade, score, country, avatar_url, created_at')
    .order('created_at', { ascending: false })
    .limit(10)
  return (data ?? []) as TickerRow[]
}

export default function RecentResultsTicker() {
  const [rows, setRows] = useState<TickerRow[]>([])
  const animRef = useRef<Animation | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      try {
        const { data, ts } = JSON.parse(cached)
        if (Date.now() - ts < CACHE_TTL) { setRows(data); return }
      } catch { /* invalid cache */ }
    }
    fetchRecent().then(data => {
      if (data.length > 0) {
        setRows(data)
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }))
      }
    })
  }, [])

  // 啟動滾動動畫
  useEffect(() => {
    if (!listRef.current || rows.length < 2) return
    const el = listRef.current
    const totalH = rows.length * ITEM_H
    const duration = rows.length * 4000 // 每筆 4 秒

    animRef.current?.cancel()
    animRef.current = el.animate(
      [{ transform: 'translateY(0)' }, { transform: `translateY(-${totalH}px)` }],
      { duration, iterations: Infinity, easing: 'linear' }
    )
    return () => animRef.current?.cancel()
  }, [rows])

  if (rows.length === 0) return null

  // 複製一份讓迴圈無縫
  const display = [...rows, ...rows]

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <p className="text-gray-500 text-xs font-bold tracking-wide mb-3">// 最新測試動態</p>

      <div
        style={{ height: ITEM_H * VISIBLE, overflow: 'hidden', position: 'relative' }}
      >
        <div ref={listRef}>
          {display.map((row, i) => (
            <div
              key={`${row.id}-${i}`}
              style={{ height: ITEM_H }}
              className="flex items-center gap-3 border-b border-gray-800/50 last:border-0"
            >
              {/* Avatar */}
              <div className="shrink-0 w-9 h-9 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                {row.avatar_url ? (
                  <img src={row.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-gray-400">
                    {row.display_name?.[0]?.toUpperCase() ?? '?'}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-gray-200 text-sm font-medium truncate">
                  {row.display_name ?? '匿名用戶'}
                  {row.country && (
                    <span className="ml-1.5 text-xs">{countryFlag(row.country)}</span>
                  )}
                </p>
                <p className="text-gray-500 text-xs truncate">
                  {scenarioNames[row.scenario_id] ?? row.scenario_id}・{timeAgo(row.created_at)}
                </p>
              </div>

              {/* Grade + Score */}
              <div className="shrink-0 text-right">
                <span
                  className="text-xl font-black"
                  style={{ color: gradeColors[row.grade] ?? '#fff' }}
                >
                  {row.grade}
                </span>
                <p className="text-gray-600 text-xs">{row.score} 分</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
