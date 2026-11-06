import { useState, useCallback, useEffect } from 'react'
import { BarChart2 } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import StockQuoteCard from '../components/StockQuoteCard'
import PriceChart from '../components/PriceChart'
import NewsFeed from '../components/NewsFeed'
import SentimentSummary from '../components/SentimentSummary'
import { useStockData } from '../hooks/useStockData'
import { useNewsData } from '../hooks/useNewsData'
import { analyzeMultipleArticles } from '../utils/sentimentAnalyzer'
import type { NewsArticle } from '../types/stock'

type Timeframe = '1D' | '1W' | '1M'

// Skeleton blocks for the right column while news loads
function NewsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-700/60 p-4"
          style={{ backgroundColor: '#1e293b' }}
        >
          <div className="flex justify-between mb-2">
            <div className="h-3 w-24 animate-pulse rounded bg-slate-700/60" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-slate-700/60" />
          </div>
          <div className="h-4 w-full animate-pulse rounded bg-slate-700/60 mb-1.5" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-slate-700/60 mb-3" />
          <div className="h-3 w-full animate-pulse rounded bg-slate-700/60" />
          <div className="h-3 w-3/5 animate-pulse rounded bg-slate-700/60 mt-1" />
        </div>
      ))}
    </div>
  )
}

function SentimentSkeleton() {
  return (
    <div
      className="w-full rounded-xl border border-slate-700/60 p-6"
      style={{ backgroundColor: '#1e293b' }}
    >
      <div className="h-3 w-32 animate-pulse rounded bg-slate-700/60 mb-5" />
      <div className="flex justify-center mb-4">
        <div className="h-32 w-52 animate-pulse rounded bg-slate-700/60" />
      </div>
      <div className="flex justify-center gap-6 mb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className="h-3 w-14 animate-pulse rounded bg-slate-700/60" />
            <div className="h-4 w-8 animate-pulse rounded bg-slate-700/60" />
          </div>
        ))}
      </div>
      <div className="h-3 w-full animate-pulse rounded bg-slate-700/60 mt-4 pt-4" />
    </div>
  )
}

export default function Dashboard() {
  const { quote, timeSeries, loading: stockLoading, error: stockError, fetchQuote, fetchTimeSeries } = useStockData()
  const { news, loading: newsLoading, error: newsError, fetchNews } = useNewsData()

  const [activeSymbol, setActiveSymbol] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState<Timeframe>('1M')
  const [analyzedArticles, setAnalyzedArticles] = useState<NewsArticle[]>([])
  const [overallScore, setOverallScore] = useState(0)
  const [overallLabel, setOverallLabel] = useState<'Bullish' | 'Bearish' | 'Neutral'>('Neutral')

  // Run sentiment analysis whenever news updates
  useEffect(() => {
    if (news.length === 0) {
      setAnalyzedArticles([])
      setOverallScore(0)
      setOverallLabel('Neutral')
      return
    }
    const { articles, averageScore, overallLabel: label } = analyzeMultipleArticles(news)
    setAnalyzedArticles(articles)
    setOverallScore(averageScore)
    setOverallLabel(label)
  }, [news])

  const handleSearch = useCallback(
    async (symbol: string) => {
      setActiveSymbol(symbol)
      await Promise.all([
        fetchQuote(symbol),
        fetchTimeSeries(symbol, timeframe),
        fetchNews(symbol),
      ])
    },
    [fetchQuote, fetchTimeSeries, fetchNews, timeframe],
  )

  const handleTimeframeChange = useCallback(
    async (tf: Timeframe) => {
      setTimeframe(tf)
      if (activeSymbol) await fetchTimeSeries(activeSymbol, tf)
    },
    [activeSymbol, fetchTimeSeries],
  )

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-6xl flex flex-col gap-6">

        {/* Search — centered, capped width */}
        <div className="mx-auto w-full max-w-2xl">
          <SearchBar onSearch={handleSearch} loading={stockLoading || newsLoading} />
        </div>

        {/* Error banners */}
        {stockError && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {stockError}
          </div>
        )}
        {newsError && (
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400">
            News: {newsError}
          </div>
        )}

        {/* Welcome state */}
        {!activeSymbol && (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <BarChart2 size={48} className="text-slate-600" />
            <p className="text-lg font-medium text-slate-400">
              Search for a stock symbol to get started
            </p>
            <p className="text-sm text-slate-600">Try AAPL, TSLA, or GOOGL</p>
          </div>
        )}

        {/* Two-column layout once a symbol is active */}
        {activeSymbol && (
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* Left column — 60% */}
            <div className="w-full lg:w-3/5 flex flex-col gap-6">
              <StockQuoteCard quote={stockLoading ? null : quote} />
              <PriceChart
                data={stockLoading ? [] : timeSeries}
                timeframe={timeframe}
                onTimeframeChange={handleTimeframeChange}
              />
            </div>

            {/* Right column — 40% */}
            <div className="w-full lg:w-2/5 flex flex-col gap-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                News &amp; Sentiment
              </h2>

              {newsLoading ? (
                <>
                  <SentimentSkeleton />
                  <NewsSkeleton />
                </>
              ) : (
                <>
                  {analyzedArticles.length > 0 && (
                    <SentimentSummary
                      articles={analyzedArticles}
                      overallScore={overallScore}
                      overallLabel={overallLabel}
                    />
                  )}
                  <div className="overflow-y-auto" style={{ maxHeight: '72vh' }}>
                    <NewsFeed articles={analyzedArticles} />
                  </div>
                </>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
