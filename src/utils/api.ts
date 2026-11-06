import axios from 'axios'

export const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY as string
export const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY as string

export const alphaVantageApi = axios.create({
  baseURL: 'https://www.alphavantage.co/query',
})

export const finnhubApi = axios.create({
  baseURL: 'https://finnhub.io/api/v1',
  params: {
    token: FINNHUB_API_KEY,
  },
})
