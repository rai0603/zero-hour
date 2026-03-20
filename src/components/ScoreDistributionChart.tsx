// 常態分配圖：顯示用戶分數在所有受測者中的相對位置

const MEAN = 220
const STD = 85
const SCORE_MIN = 0
const SCORE_MAX = 500

const GRADE_ZONES = [
  { label: 'F', from: 0,   to: 80,  color: '#6b7280' },
  { label: 'D', from: 80,  to: 180, color: '#ef4444' },
  { label: 'C', from: 180, to: 280, color: '#f97316' },
  { label: 'B', from: 280, to: 380, color: '#3b82f6' },
  { label: 'A', from: 380, to: 450, color: '#22c55e' },
  { label: 'S', from: 450, to: 500, color: '#eab308' },
]

function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1
  x = Math.abs(x)
  const a1 =  0.254829592
  const a2 = -0.284496736
  const a3 =  1.421413741
  const a4 = -1.453152027
  const a5 =  1.061405429
  const p  =  0.3275911
  const t = 1 / (1 + p * x)
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
  return sign * y
}

function normalCDF(x: number, mean: number, std: number): number {
  return 0.5 * (1 + erf((x - mean) / (std * Math.sqrt(2))))
}

function scoreToSvgX(score: number, svgW: number): number {
  return ((score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * svgW
}

function normalPDF(x: number, mean: number, std: number): number {
  return Math.exp(-0.5 * ((x - mean) / std) ** 2) / (std * Math.sqrt(2 * Math.PI))
}

function buildCurvePath(svgW: number, _svgH: number, chartTop: number, chartBottom: number): string {
  const steps = 200
  const points: [number, number][] = []
  const maxPDF = normalPDF(MEAN, MEAN, STD)

  for (let i = 0; i <= steps; i++) {
    const score = SCORE_MIN + (i / steps) * (SCORE_MAX - SCORE_MIN)
    const x = scoreToSvgX(score, svgW)
    const pdf = normalPDF(score, MEAN, STD)
    const y = chartBottom - ((pdf / maxPDF) * (chartBottom - chartTop))
    points.push([x, y])
  }

  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
}

function buildFilledPath(score: number, svgW: number, chartTop: number, chartBottom: number): string {
  const steps = 150
  const maxPDF = normalPDF(MEAN, MEAN, STD)
  const points: [number, number][] = []

  for (let i = 0; i <= steps; i++) {
    const s = SCORE_MIN + (i / steps) * score
    const x = scoreToSvgX(s, svgW)
    const pdf = normalPDF(s, MEAN, STD)
    const y = chartBottom - ((pdf / maxPDF) * (chartBottom - chartTop))
    points.push([x, y])
  }

  const userX = scoreToSvgX(score, svgW)
  const path =
    points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ') +
    ` L${userX.toFixed(1)},${chartBottom} L0,${chartBottom} Z`

  return path
}

interface ScoreDistributionChartProps {
  score: number
}

export default function ScoreDistributionChart({ score }: ScoreDistributionChartProps) {
  const percentile = Math.round(normalCDF(score, MEAN, STD) * 100)

  const svgW = 320
  const svgH = 120
  const chartTop = 12
  const chartBottom = 88
  const labelY = 104

  const curvePath = buildCurvePath(svgW, svgH, chartTop, chartBottom)
  const filledPath = buildFilledPath(score, svgW, chartTop, chartBottom)
  const userX = scoreToSvgX(score, svgW)

  const currentGrade = GRADE_ZONES.find(g => score >= g.from && score < g.to) ?? GRADE_ZONES[GRADE_ZONES.length - 1]

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      {/* 百分位標題 */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-orange-400 font-black text-2xl">{percentile}%</span>
        <span className="text-gray-400 text-sm">的受測者分數低於你</span>
      </div>

      {/* SVG 圖表 */}
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full"
        style={{ overflow: 'visible' }}
      >
        {/* Grade 底色區塊 */}
        {GRADE_ZONES.map(zone => {
          const x1 = scoreToSvgX(zone.from, svgW)
          const x2 = scoreToSvgX(zone.to, svgW)
          return (
            <rect
              key={zone.label}
              x={x1} y={chartTop}
              width={x2 - x1} height={chartBottom - chartTop}
              fill={zone.color}
              opacity={0.07}
            />
          )
        })}

        {/* 填色區域（用戶分數左側） */}
        <path d={filledPath} fill="#f97316" opacity={0.25} />

        {/* 鐘型曲線 */}
        <path d={curvePath} fill="none" stroke="#6b7280" strokeWidth="1.5" />

        {/* 用戶分數垂直線 */}
        <line
          x1={userX} y1={chartTop - 4}
          x2={userX} y2={chartBottom}
          stroke={currentGrade.color}
          strokeWidth="2"
          strokeDasharray="3 2"
        />

        {/* 用戶分數圓點 */}
        <circle cx={userX} cy={chartTop - 4} r="3.5" fill={currentGrade.color} />

        {/* 底線 */}
        <line x1={0} y1={chartBottom} x2={svgW} y2={chartBottom} stroke="#374151" strokeWidth="1" />

        {/* Grade 標籤 */}
        {GRADE_ZONES.map(zone => {
          const midX = scoreToSvgX((zone.from + zone.to) / 2, svgW)
          return (
            <text
              key={zone.label}
              x={midX} y={labelY}
              textAnchor="middle"
              fontSize="9"
              fill={zone.color}
              fontWeight="700"
              opacity={0.8}
            >
              {zone.label}
            </text>
          )
        })}

        {/* 分數標籤 */}
        <text
          x={Math.min(Math.max(userX, 18), svgW - 18)}
          y={chartTop - 10}
          textAnchor="middle"
          fontSize="9"
          fill={currentGrade.color}
          fontWeight="700"
        >
          {score}
        </text>
      </svg>
    </div>
  )
}
