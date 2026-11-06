import type { NewsArticle } from '../types/stock'

interface SentimentResult {
  score: number
  label: 'Bullish' | 'Bearish' | 'Neutral'
}

interface AnalyzedArticle extends NewsArticle {
  sentiment: SentimentResult
}

interface MultiArticleSentiment {
  articles: AnalyzedArticle[]
  averageScore: number
  overallLabel: 'Bullish' | 'Bearish' | 'Neutral'
}

const BULLISH_TERMS = [
  'surge', 'rally', 'beat expectations', 'record high', 'upgrade', 'growth',
  'profit', 'gains', 'outperform', 'buy', 'bullish', 'positive', 'strong',
  'soar', 'boom', 'breakthrough', 'innovative', 'exceed', 'optimistic',
  'revenue growth', 'all-time high', 'momentum',
]

const BEARISH_TERMS = [
  'crash', 'plunge', 'miss expectations', 'downgrade', 'loss', 'decline',
  'selloff', 'bearish', 'negative', 'weak', 'drop', 'fall', 'concern',
  'risk', 'warning', 'layoff', 'debt', 'lawsuit', 'investigate', 'overvalued',
  'recession', 'bankruptcy', 'fraud',
]

function countMatches(text: string, terms: string[]): number {
  const lower = text.toLowerCase()
  return terms.reduce((count, term) => {
    // Use word-boundary-aware matching: check that the term isn't mid-word
    const regex = new RegExp(`(?<![a-z])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-z])`, 'gi')
    const matches = lower.match(regex)
    return count + (matches ? matches.length : 0)
  }, 0)
}

function normalizeScore(raw: number, maxPossible: number): number {
  if (maxPossible === 0) return 0
  return Math.max(-1, Math.min(1, raw / maxPossible))
}

function labelFromScore(score: number): 'Bullish' | 'Bearish' | 'Neutral' {
  if (score > 0.15) return 'Bullish'
  if (score < -0.15) return 'Bearish'
  return 'Neutral'
}

export function analyzeSentiment(headline: string, summary: string): SentimentResult {
  // Headline matches count double
  const headlineBullish = countMatches(headline, BULLISH_TERMS) * 2
  const headlineBearish = countMatches(headline, BEARISH_TERMS) * 2
  const summaryBullish  = countMatches(summary, BULLISH_TERMS)
  const summaryBearish  = countMatches(summary, BEARISH_TERMS)

  const rawScore = (headlineBullish + summaryBullish) - (headlineBearish + summaryBearish)

  // Max possible = all terms match in headline (×2) + summary (×1)
  const totalTerms = BULLISH_TERMS.length + BEARISH_TERMS.length
  const maxPossible = totalTerms * 3 // 2 (headline) + 1 (summary)

  const score = normalizeScore(rawScore, maxPossible)

  return { score, label: labelFromScore(score) }
}

export function analyzeMultipleArticles(articles: NewsArticle[]): MultiArticleSentiment {
  if (articles.length === 0) {
    return { articles: [], averageScore: 0, overallLabel: 'Neutral' }
  }

  const analyzed: AnalyzedArticle[] = articles.map((article) => ({
    ...article,
    sentiment: analyzeSentiment(article.headline, article.summary),
  }))

  const averageScore =
    analyzed.reduce((sum, a) => sum + a.sentiment.score, 0) / analyzed.length

  return {
    articles: analyzed,
    averageScore,
    overallLabel: labelFromScore(averageScore),
  }
}
