import type { NewsArticle } from '../types/stock'

interface SentimentSummaryProps {
  articles: NewsArticle[]
  overallScore: number
  overallLabel: 'Bullish' | 'Bearish' | 'Neutral'
}

// SVG gauge constants
const CX = 110
const CY = 110
const R  = 80
const STROKE = 14

// Map score [-1, 1] to angle [180°, 0°] on the semicircle
// 180° = far left (bearish), 90° = top (neutral), 0° = far right (bullish)
function scoreToAngle(score: number): number {
  const clamped = Math.max(-1, Math.min(1, score))
  return 180 - ((clamped + 1) / 2) * 180
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy - r * Math.sin(rad),
  }
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polarToCartesian(cx, cy, r, startDeg)
  const end   = polarToCartesian(cx, cy, r, endDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`
}

const LABEL_COLOR: Record<string, string> = {
  Bullish: '#34d399',
  Bearish: '#f87171',
  Neutral: '#94a3b8',
}

const DOT_CLASS: Record<string, string> = {
  Bullish: 'bg-emerald-400',
  Bearish: 'bg-red-400',
  Neutral: 'bg-slate-400',
}

function generateSummary(
  total: number,
  bullish: number,
  bearish: number,
  overallLabel: string,
): string {
  if (total === 0) return 'No recent articles available to assess sentiment.'

  const dominant = bullish >= bearish ? bullish : bearish
  const dominantLabel = bullish >= bearish ? 'bullish' : 'bearish'

  if (overallLabel === 'Neutral') {
    return `Sentiment is mixed across ${total} recent article${total !== 1 ? 's' : ''} with no clear directional signal.`
  }

  return `Sentiment is mostly ${dominantLabel.toLowerCase()} with ${dominant} out of ${total} recent article${total !== 1 ? 's' : ''} showing ${dominantLabel} signals.`
}

export default function SentimentSummary({
  articles,
  overallScore,
  overallLabel,
}: SentimentSummaryProps) {
  const total   = articles.length
  const bullish = articles.filter((a) => a.sentiment?.label === 'Bullish').length
  const bearish = articles.filter((a) => a.sentiment?.label === 'Bearish').length
  const neutral = total - bullish - bearish

  const needleAngle = scoreToAngle(overallScore)
  const needleTip   = polarToCartesian(CX, CY, R - 4, needleAngle)
  const labelColor  = LABEL_COLOR[overallLabel] ?? '#94a3b8'
  const summary     = generateSummary(total, bullish, bearish, overallLabel)

  const breakdown = [
    { label: 'Bullish', count: bullish },
    { label: 'Bearish', count: bearish },
    { label: 'Neutral', count: neutral },
  ] as const

  return (
    <div
      className="w-full rounded-xl border border-slate-700/60 p-6 shadow-lg"
      style={{ backgroundColor: '#1e293b' }}
    >
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-5">
        Sentiment Analysis
      </h2>

      {/* Gauge */}
      <div className="flex justify-center mb-2">
        <svg width={220} height={130} aria-label="Sentiment gauge">
          <defs>
            {/* Track segments: bearish → neutral → bullish */}
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#f87171" />
              <stop offset="45%"  stopColor="#94a3b8" />
              <stop offset="55%"  stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>

            {/* Glow filter for needle */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background track */}
          <path
            d={arcPath(CX, CY, R, 0, 180)}
            fill="none"
            stroke="#1e293b"
            strokeWidth={STROKE + 4}
            strokeLinecap="round"
          />

          {/* Colored arc */}
          <path
            d={arcPath(CX, CY, R, 0, 180)}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />

          {/* Tick marks */}
          {[0, 45, 90, 135, 180].map((deg) => {
            const outer = polarToCartesian(CX, CY, R + STROKE / 2 + 2, deg)
            const inner = polarToCartesian(CX, CY, R - STROKE / 2 - 2, deg)
            return (
              <line
                key={deg}
                x1={inner.x} y1={inner.y}
                x2={outer.x} y2={outer.y}
                stroke="#0f172a"
                strokeWidth={2}
              />
            )
          })}

          {/* Needle */}
          <line
            x1={CX}
            y1={CY}
            x2={needleTip.x}
            y2={needleTip.y}
            stroke={labelColor}
            strokeWidth={2.5}
            strokeLinecap="round"
            filter="url(#glow)"
          />

          {/* Needle pivot */}
          <circle cx={CX} cy={CY} r={5} fill={labelColor} />
          <circle cx={CX} cy={CY} r={2.5} fill="#0f172a" />

          {/* Label below pivot */}
          <text
            x={CX}
            y={CY + 22}
            textAnchor="middle"
            fill={labelColor}
            fontSize={15}
            fontWeight="700"
            fontFamily="inherit"
          >
            {overallLabel}
          </text>

          {/* Score value */}
          <text
            x={CX}
            y={CY + 36}
            textAnchor="middle"
            fill="#64748b"
            fontSize={10}
            fontFamily="inherit"
          >
            {overallScore >= 0 ? '+' : ''}{overallScore.toFixed(2)}
          </text>

          {/* Axis labels */}
          <text x={14} y={CY + 6} fill="#f87171" fontSize={9} fontFamily="inherit">Bear</text>
          <text x={CX - 10} y={26} fill="#94a3b8" fontSize={9} fontFamily="inherit">Neutral</text>
          <text x={183} y={CY + 6} fill="#34d399" fontSize={9} fontFamily="inherit">Bull</text>
        </svg>
      </div>

      {/* Breakdown */}
      <div className="flex justify-center gap-6 mb-4">
        {breakdown.map(({ label, count }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${DOT_CLASS[label]}`} />
              <span className="text-xs text-slate-400">{label}</span>
            </div>
            <span className="text-sm font-semibold text-white">
              {count}
              <span className="text-slate-500 font-normal text-xs"> / {total}</span>
            </span>
          </div>
        ))}
      </div>

      {/* AI summary */}
      <p className="text-center text-xs text-slate-400 leading-relaxed border-t border-slate-700/60 pt-4">
        {summary}
      </p>
    </div>
  )
}
