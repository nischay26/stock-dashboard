import { TrendingUp, TrendingDown, Clock } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { StockQuote } from '../types/stock'

interface StockQuoteCardProps {
  quote: StockQuote | null
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-slate-700/60 ${className ?? ''}`} />
  )
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-slate-500 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium text-slate-200">{value}</span>
    </div>
  )
}

function formatPrice(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatVolume(n: number) {
  return n.toLocaleString('en-US')
}

function formatTimestamp(ts: string) {
  try {
    return format(parseISO(ts), 'MMM d, yyyy')
  } catch {
    return ts
  }
}

export default function StockQuoteCard({ quote }: StockQuoteCardProps) {
  if (!quote) {
    return (
      <div
        className="w-full rounded-xl border border-slate-700/60 p-6"
        style={{ backgroundColor: '#1e293b' }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-10 w-36" />
          </div>
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-700/60">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const isPositive = quote.change >= 0
  const ChangeIcon = isPositive ? TrendingUp : TrendingDown
  const changeColor = isPositive ? 'text-emerald-400' : 'text-red-400'
  const changeBg = isPositive ? 'bg-emerald-400/10' : 'bg-red-400/10'
  const changeBorder = isPositive ? 'border-emerald-400/20' : 'border-red-400/20'
  const sign = isPositive ? '+' : ''

  return (
    <div
      className="w-full rounded-xl border border-slate-700/60 p-6 shadow-lg"
      style={{ backgroundColor: '#1e293b' }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <span className="text-sm font-semibold tracking-widest text-slate-400 uppercase">
            {quote.symbol}
          </span>
          <p className="text-4xl font-bold text-white mt-1">
            ${formatPrice(quote.price)}
          </p>
        </div>

        {/* Change badge */}
        <div
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 ${changeColor} ${changeBg} ${changeBorder}`}
        >
          <ChangeIcon size={15} strokeWidth={2.5} />
          <span className="text-sm font-semibold">
            {sign}{formatPrice(quote.change)}
          </span>
          <span className="text-sm font-medium opacity-80">
            ({sign}{quote.changePercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-700/60">
        <StatItem label="High" value={`$${formatPrice(quote.high)}`} />
        <StatItem label="Low"  value={`$${formatPrice(quote.low)}`} />
        <StatItem label="Volume" value={formatVolume(quote.volume)} />
        <StatItem label="Prev. Close" value={`$${formatPrice(quote.previousClose)}`} />
      </div>

      {/* Timestamp */}
      <div className="flex items-center gap-1.5 mt-4 text-xs text-slate-500">
        <Clock size={12} />
        <span>As of {formatTimestamp(quote.timestamp)}</span>
      </div>
    </div>
  )
}
