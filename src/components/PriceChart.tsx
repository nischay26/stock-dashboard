import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import type { StockTimeSeries } from '../types/stock'

interface PriceChartProps {
  data: StockTimeSeries[]
  timeframe: '1D' | '1W' | '1M'
  onTimeframeChange: (tf: '1D' | '1W' | '1M') => void
}

const TIMEFRAMES: Array<'1D' | '1W' | '1M'> = ['1D', '1W', '1M']

function formatXAxis(dateStr: string, timeframe: '1D' | '1W' | '1M') {
  try {
    const date = parseISO(dateStr)
    if (timeframe === '1D') return format(date, 'HH:mm')
    if (timeframe === '1W') return format(date, 'EEE')
    return format(date, 'MMM d')
  } catch {
    return dateStr
  }
}

function formatTooltipDate(dateStr: string, timeframe: '1D' | '1W' | '1M') {
  try {
    const date = parseISO(dateStr)
    if (timeframe === '1D') return format(date, 'HH:mm')
    return format(date, 'MMM d, yyyy')
  } catch {
    return dateStr
  }
}

function CustomTooltip({
  active,
  payload,
  timeframe,
}: TooltipProps<number, string> & { timeframe: '1D' | '1W' | '1M' } & {
  payload?: Array<{ payload: StockTimeSeries }>
}) {
  if (!active || !payload?.length) return null
  const { date, close } = payload[0].payload

  return (
    <div
      className="rounded-lg border border-slate-700 px-3 py-2 text-sm shadow-xl"
      style={{ backgroundColor: '#0f172a' }}
    >
      <p className="text-slate-400 mb-0.5">{formatTooltipDate(date, timeframe)}</p>
      <p className="font-semibold text-white">
        ${close.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  )
}

export default function PriceChart({ data, timeframe, onTimeframeChange }: PriceChartProps) {
  const isUptrend =
    data.length >= 2 ? data[data.length - 1].close >= data[0].close : true

  const color = isUptrend ? '#34d399' : '#f87171'   // emerald-400 / red-400
  const gradientId = 'priceGradient'

  const yMin = data.length
    ? Math.min(...data.map((d) => d.close)) * 0.998
    : 'auto'
  const yMax = data.length
    ? Math.max(...data.map((d) => d.close)) * 1.002
    : 'auto'

  return (
    <div
      className="w-full rounded-xl border border-slate-700/60 p-6 shadow-lg"
      style={{ backgroundColor: '#1e293b' }}
    >
      {/* Timeframe toggles */}
      <div className="flex items-center justify-end gap-1 mb-5">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => onTimeframeChange(tf)}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
              timeframe === tf
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Chart */}
      {data.length === 0 ? (
        <div
          className="flex items-center justify-center text-slate-500 text-sm"
          style={{ height: 300 }}
        >
          No chart data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#1e293b" strokeDasharray="4 4" vertical={false} />

            <XAxis
              dataKey="date"
              tickFormatter={(v) => formatXAxis(v as string, timeframe)}
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />

            <YAxis
              domain={[yMin, yMax]}
              tickFormatter={(v: number) => `$${v.toFixed(0)}`}
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={58}
            />

            <Tooltip
              content={<CustomTooltip timeframe={timeframe} />}
              cursor={{ stroke: '#475569', strokeWidth: 1 }}
            />

            <Area
              type="monotone"
              dataKey="close"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
