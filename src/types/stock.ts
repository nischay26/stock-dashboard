export interface StockQuote {
  symbol: string
  price: number
  change: number
  changePercent: number
  high: number
  low: number
  volume: number
  previousClose: number
  timestamp: string
}

export interface StockTimeSeries {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface NewsArticle {
  id: string
  headline: string
  summary: string
  source: string
  url: string
  publishedAt: string
  relatedSymbol: string
  sentiment?: {
    score: number
    label: 'Bullish' | 'Bearish' | 'Neutral'
  }
}

export interface WatchlistItem {
  symbol: string
  name: string
  addedAt: string
}

export interface TradingSignal {
  signal: 'Bullish' | 'Bearish' | 'Neutral'
  confidence: number // 0-100
  reasons: string[]
  priceTrend: string
  sentimentScore: number
}
