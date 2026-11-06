import { useState, useCallback } from 'react'
import { alphaVantageApi, ALPHA_VANTAGE_API_KEY } from '../utils/api'
import type { StockQuote, StockTimeSeries } from '../types/stock'

interface UseStockDataReturn {
  quote: StockQuote | null
  timeSeries: StockTimeSeries[]
  loading: boolean
  error: string | null
  fetchQuote: (symbol: string) => Promise<void>
  fetchTimeSeries: (symbol: string, timeframe: '1D' | '1W' | '1M') => Promise<void>
}

function isApiLimitReached(data: Record<string, unknown>): boolean {
  return (
    'Information' in data ||
    'Note' in data ||
    ('Global Quote' in data && Object.keys(data['Global Quote'] as object).length === 0)
  )
}

export function useStockData(): UseStockDataReturn {
  const [quote, setQuote] = useState<StockQuote | null>(null)
  const [timeSeries, setTimeSeries] = useState<StockTimeSeries[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQuote = useCallback(async (symbol: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data } = await alphaVantageApi.get<Record<string, unknown>>('', {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol,
          apikey: ALPHA_VANTAGE_API_KEY,
        },
      })

      if (isApiLimitReached(data)) {
        setError('API limit reached (25 calls/day on free tier). Please try again tomorrow.')
        return
      }

      const raw = data['Global Quote'] as Record<string, string>

      if (!raw || !raw['05. price']) {
        setError(`No data found for symbol "${symbol}". Check the ticker and try again.`)
        return
      }

      setQuote({
        symbol: raw['01. symbol'],
        price: parseFloat(raw['05. price']),
        change: parseFloat(raw['09. change']),
        changePercent: parseFloat(raw['10. change percent'].replace('%', '')),
        high: parseFloat(raw['03. high']),
        low: parseFloat(raw['04. low']),
        volume: parseInt(raw['06. volume'], 10),
        previousClose: parseFloat(raw['08. previous close']),
        timestamp: raw['07. latest trading day'],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quote.')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTimeSeries = useCallback(async (symbol: string, timeframe: '1D' | '1W' | '1M') => {
    setLoading(true)
    setError(null)

    try {
      const params: Record<string, string> = {
        symbol,
        apikey: ALPHA_VANTAGE_API_KEY,
      }

      let seriesKey: string

      if (timeframe === '1D') {
        params.function = 'TIME_SERIES_INTRADAY'
        params.interval = '5min'
        seriesKey = 'Time Series (5min)'
      } else {
        params.function = 'TIME_SERIES_DAILY'
        seriesKey = 'Time Series (Daily)'
      }

      const { data } = await alphaVantageApi.get<Record<string, unknown>>('', { params })

      if (isApiLimitReached(data)) {
        setError('API limit reached (25 calls/day on free tier). Please try again tomorrow.')
        return
      }

      const rawSeries = data[seriesKey] as Record<string, Record<string, string>> | undefined

      if (!rawSeries) {
        setError(`No time series data found for "${symbol}".`)
        return
      }

      const limit = timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : Infinity

      const parsed: StockTimeSeries[] = Object.entries(rawSeries)
        .slice(0, limit)
        .map(([date, values]) => ({
          date,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume'], 10),
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

      setTimeSeries(parsed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch time series.')
    } finally {
      setLoading(false)
    }
  }, [])

  return { quote, timeSeries, loading, error, fetchQuote, fetchTimeSeries }
}
