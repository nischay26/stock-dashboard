# Stock Research Dashboard

A web dashboard for looking up any stock: live quote, interactive price chart, the latest company news, and a sentiment rating that says whether the week's headlines are bullish, bearish, or neutral.

Built with React, TypeScript, and Tailwind CSS, using the Alpha Vantage and Finnhub APIs.

## Features

- **Ticker search.** Enter a symbol like `AAPL`, `TSLA`, or `GOOGL` to load its data.
- **Live quote card.** Shows price, daily change and percent change, high/low, volume, and previous close.
- **Interactive price chart.** An area chart (Recharts) that switches between **1D** (5-minute intraday), **1W**, and **1M** views, with formatted axes and tooltips.
- **Company news feed.** Shows the 10 most recent articles about the company from the past week, via Finnhub.
- **News sentiment analysis.** Each article gets a score from bullish and bearish keywords, and an SVG gauge shows the overall rating.
- **API limit handling.** Detects when the free-tier limit is hit and shows a clear message instead of failing silently.
- **Loading skeletons** while quote, chart, and news data load.

## How the Sentiment Scoring Works

`src/utils/sentimentAnalyzer.ts` uses a keyword-based model:

1. Each headline and summary is checked against lists of bullish terms (e.g. *surge, upgrade, record high*) and bearish terms (e.g. *downgrade, lawsuit, selloff*). The matching uses word boundaries, so a term inside another word doesn't count.
2. Headline matches count **twice as much** as summary matches, because headlines carry the main signal.
3. The raw score is normalized to a range of **-1 to 1** and labeled **Bullish** (> 0.15), **Bearish** (< -0.15), or **Neutral**.
4. Article scores are averaged to get the overall rating shown on the gauge.

## Tech Stack

| Area | Tools |
|---|---|
| Frontend | React 19, TypeScript, React Router |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Data | Alpha Vantage (quotes, time series), Finnhub (company news), axios |
| Build | Vite |

## Project Structure

```
src/
├── components/   SearchBar, StockQuoteCard, PriceChart, NewsFeed, SentimentSummary, Navbar
├── hooks/        useStockData, useNewsData (data fetching + loading/error state)
├── pages/        Dashboard, Watchlist
├── types/        Shared TypeScript types for quotes, time series, and news
└── utils/        API clients and the sentiment analyzer
```

## Running Locally

1. Get free API keys from [Alpha Vantage](https://www.alphavantage.co/support/#api-key) and [Finnhub](https://finnhub.io/register).
2. Clone the repo and install dependencies:
   ```bash
   git clone https://github.com/nischay26/stock-dashboard.git
   cd stock-dashboard
   npm install
   ```
3. Copy `.env.example` to `.env` and add your keys:
   ```
   VITE_ALPHA_VANTAGE_API_KEY=your_key_here
   VITE_FINNHUB_API_KEY=your_key_here
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```

> **Note:** Alpha Vantage's free tier allows 25 requests per day, so you may hit the limit after a few searches.

