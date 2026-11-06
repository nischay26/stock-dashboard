import { formatDistanceToNow } from 'date-fns'
import { TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react'
import type { NewsArticle } from '../types/stock'

interface NewsFeedProps {
  articles: NewsArticle[]
}

function SentimentBadge({
  label,
  score,
}: {
  label: 'Bullish' | 'Bearish' | 'Neutral'
  score: number
}) {
  const config = {
    Bullish: {
      icon: TrendingUp,
      classes: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    },
    Bearish: {
      icon: TrendingDown,
      classes: 'bg-red-400/10 text-red-400 border-red-400/20',
    },
    Neutral: {
      icon: Minus,
      classes: 'bg-slate-600/40 text-slate-400 border-slate-600/40',
    },
  }

  const { icon: Icon, classes } = config[label]

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${classes}`}
    >
      <Icon size={11} strokeWidth={2.5} />
      {label}
      <span className="opacity-70">
        {score >= 0 ? '+' : ''}{score.toFixed(2)}
      </span>
    </span>
  )
}

function formatPublishedAt(publishedAt: string): string {
  try {
    // publishedAt is already a formatted string like "Mar 20, 2025 3:45 PM"
    // Try parsing it back to a Date for relative time
    const date = new Date(publishedAt)
    if (isNaN(date.getTime())) return publishedAt
    return formatDistanceToNow(date, { addSuffix: true })
  } catch {
    return publishedAt
  }
}

function ArticleCard({ article }: { article: NewsArticle }) {
  const sentiment = article.sentiment

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-slate-700/60 p-4 transition-all hover:border-slate-600 hover:brightness-110"
      style={{ backgroundColor: '#1e293b' }}
    >
      {/* Top row: sentiment badge + source/time */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <span className="text-xs text-slate-500">
          <span className="text-slate-400 font-medium">{article.source}</span>
          {' · '}
          {formatPublishedAt(article.publishedAt)}
        </span>

        {sentiment && (
          <SentimentBadge label={sentiment.label} score={sentiment.score} />
        )}
      </div>

      {/* Headline */}
      <p className="text-sm font-semibold text-white leading-snug mb-1.5 group-hover:text-blue-300 transition-colors line-clamp-2">
        {article.headline}
        <ExternalLink
          size={11}
          className="inline-block ml-1 opacity-0 group-hover:opacity-50 transition-opacity align-baseline"
        />
      </p>

      {/* Summary */}
      {article.summary && (
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
          {article.summary}
        </p>
      )}
    </a>
  )
}

export default function NewsFeed({ articles }: NewsFeedProps) {
  if (articles.length === 0) {
    return (
      <p className="text-sm text-slate-500 text-center py-8">
        No recent news found for this symbol.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
}
