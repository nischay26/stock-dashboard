import { useState, useRef } from 'react'
import { Search, Loader2 } from 'lucide-react'

interface SearchBarProps {
  onSearch: (symbol: string) => void
  loading?: boolean
}

const QUICK_SYMBOLS = ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN']

export default function SearchBar({ onSearch, loading = false }: SearchBarProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    const symbol = value.trim()
    if (symbol) onSearch(symbol)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value.toUpperCase())
  }

  const handleQuickPick = (symbol: string) => {
    setValue(symbol)
    onSearch(symbol)
    inputRef.current?.focus()
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-3">
      {/* Input row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Search stock symbol (e.g. AAPL)"
            spellCheck={false}
            className="w-full rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none ring-1 ring-slate-700 focus:ring-blue-500 transition-all"
            style={{ backgroundColor: '#1e293b' }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !value.trim()}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Search size={16} />
          )}
          Search
        </button>
      </div>

      {/* Quick-pick chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500">Quick picks:</span>
        {QUICK_SYMBOLS.map((sym) => (
          <button
            key={sym}
            onClick={() => handleQuickPick(sym)}
            disabled={loading}
            className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300 hover:border-blue-500 hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sym}
          </button>
        ))}
      </div>
    </div>
  )
}
