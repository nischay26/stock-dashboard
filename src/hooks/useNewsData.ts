import { useState, useCallback } from 'react'
import { format, subWeeks, fromUnixTime } from 'date-fns'
import { finnhubApi } from '../utils/api'
import type { NewsArticle } from '../types/stock'

interface FinnhubArticle {
  headline: string
  summary: string
  source: string
  url: string
  datetime: number // unix timestamp
  related: string
}

interface UseNewsDataReturn {
  news: NewsArticle[]
  loading: boolean
  error: string | null
  fetchNews: (symbol: string) => Promise<void>
}

export function useNewsData(): UseNewsDataReturn {
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNews = useCallback(async (symbol: string) => {
    setLoading(true)
    setError(null)

    try {
      const today = new Date()
      const oneWeekAgo = subWeeks(today, 1)

      const { data } = await finnhubApi.get<FinnhubArticle[]>('/company-news', {
        params: {
          symbol,
          from: format(oneWeekAgo, 'yyyy-MM-dd'),
          to: format(today, 'yyyy-MM-dd'),
        },
      })

      if (!Array.isArray(data)) {
        setError('Unexpected response from news API.')
        return
      }

      if (data.length === 0) {
        setNews([])
        return
      }

      const mapped: NewsArticle[] = data
        .slice(0, 10)
        .map((article) => ({
          id: `${symbol}-${article.datetime}`,
          headline: article.headline,
          summary: article.summary,
          source: article.source,
          url: article.url,
          publishedAt: format(fromUnixTime(article.datetime), 'MMM d, yyyy h:mm a'),
          relatedSymbol: article.related ?? symbol,
        }))

      setNews(mapped)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news.')
    } finally {
      setLoading(false)
    }
  }, [])

  return { news, loading, error, fetchNews }
}
