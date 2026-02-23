'use client'
import { useEffect, useState } from 'react'
import { Search, TrendingUp, TrendingDown, Star, Plus, Loader2 } from 'lucide-react'

function fmt(n: number) {
  return new Intl.NumberFormat('en-TZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0)
}

function fmtBig(n: number) {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T'
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  return n?.toLocaleString() || '—'
}

function apiHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('invest_token') : ''
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

export default function DSEPage() {
  const [stocks, setStocks] = useState<any[]>([])
  const [sectors, setSectors] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [sector, setSector] = useState('')
  const [loading, setLoading] = useState(true)
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set())
  const [addingWatch, setAddingWatch] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (sector) params.set('sector', sector)
    const res = await fetch(`/api/dse/stocks?${params}`, { headers: apiHeaders() })
    const data = await res.json()
    setStocks(data.stocks || [])
    setSectors(data.sectors || [])

    // Load watchlist
    const wRes = await fetch('/api/watchlist', { headers: apiHeaders() })
    const wData = await wRes.json()
    const wSet = new Set<string>((wData.watchlist || []).filter((w: any) => w.type === 'DSE').map((w: any) => w.symbol))
    setWatchlist(wSet)
    setLoading(false)
  }

  useEffect(() => { load() }, [search, sector])

  async function toggleWatch(symbol: string) {
    setAddingWatch(symbol)
    if (watchlist.has(symbol)) {
      await fetch(`/api/watchlist?symbol=${symbol}&type=DSE`, { method: 'DELETE', headers: apiHeaders() })
      setWatchlist(w => { const n = new Set(w); n.delete(symbol); return n })
    } else {
      await fetch('/api/watchlist', { method: 'POST', headers: apiHeaders(), body: JSON.stringify({ symbol, type: 'DSE' }) })
      setWatchlist(w => new Set([...w, symbol]))
    }
    setAddingWatch(null)
  }

  const gainers = stocks.filter(s => parseFloat(s.change_pct) > 0).length
  const losers = stocks.filter(s => parseFloat(s.change_pct) < 0).length

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">DSE Stocks</h1>
        <p className="text-[#8b8fa8] text-sm">Dar es Salaam Stock Exchange listed companies</p>
      </div>

      {/* Market Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-4 text-center">
          <p className="text-[#8b8fa8] text-xs mb-1">Listed Companies</p>
          <p className="text-xl font-bold">{stocks.length}</p>
        </div>
        <div className="bg-[#00b359]/10 border border-[#00b359]/20 rounded-xl p-4 text-center">
          <p className="text-[#00b359] text-xs mb-1">Gainers</p>
          <p className="text-xl font-bold text-[#00b359]">{gainers}</p>
        </div>
        <div className="bg-[#e63946]/10 border border-[#e63946]/20 rounded-xl p-4 text-center">
          <p className="text-[#e63946] text-xs mb-1">Losers</p>
          <p className="text-xl font-bold text-[#e63946]">{losers}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b8fa8]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by symbol or name..."
            className="w-full bg-[#1a1d27] border border-[#2a2d3a] rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#ff1a66]"
          />
        </div>
        <select value={sector} onChange={e => setSector(e.target.value)}
          className="bg-[#1a1d27] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#ff1a66]">
          <option value="">All Sectors</option>
          {sectors.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Stocks Table */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#ff1a66]" /></div>
      ) : (
        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2d3a]">
                  <th className="text-left px-4 py-3 text-[#8b8fa8] font-medium">Company</th>
                  <th className="text-right px-4 py-3 text-[#8b8fa8] font-medium">Price (TZS)</th>
                  <th className="text-right px-4 py-3 text-[#8b8fa8] font-medium">Change</th>
                  <th className="text-right px-4 py-3 text-[#8b8fa8] font-medium hidden md:table-cell">52W High</th>
                  <th className="text-right px-4 py-3 text-[#8b8fa8] font-medium hidden md:table-cell">52W Low</th>
                  <th className="text-right px-4 py-3 text-[#8b8fa8] font-medium hidden lg:table-cell">Mkt Cap</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {stocks.map(stock => {
                  const chg = parseFloat(stock.change_pct)
                  const isUp = chg > 0
                  const isDown = chg < 0
                  const inWatch = watchlist.has(stock.symbol)
                  return (
                    <tr key={stock.symbol} className="border-b border-[#2a2d3a] last:border-0 hover:bg-[#2a2d3a]/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#ff1a66]/10 rounded-lg flex items-center justify-center text-xs font-bold text-[#ff1a66] flex-shrink-0">
                            {stock.symbol.substring(0, 3)}
                          </div>
                          <div>
                            <p className="font-semibold">{stock.symbol}</p>
                            <p className="text-[#8b8fa8] text-xs">{stock.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium">{fmt(stock.last_price)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className={`flex items-center justify-end gap-1 font-medium ${isUp ? 'text-[#00b359]' : isDown ? 'text-[#e63946]' : 'text-[#8b8fa8]'}`}>
                          {isUp && <TrendingUp className="w-3 h-3" />}
                          {isDown && <TrendingDown className="w-3 h-3" />}
                          {chg > 0 ? '+' : ''}{chg.toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-[#8b8fa8] hidden md:table-cell">{fmt(stock.week_52_high)}</td>
                      <td className="px-4 py-3 text-right text-[#8b8fa8] hidden md:table-cell">{fmt(stock.week_52_low)}</td>
                      <td className="px-4 py-3 text-right text-[#8b8fa8] hidden lg:table-cell">{fmtBig(stock.market_cap)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleWatch(stock.symbol)}
                          disabled={addingWatch === stock.symbol}
                          className={`p-1.5 rounded-lg transition-colors ${inWatch ? 'text-amber-400 bg-amber-400/10' : 'text-[#8b8fa8] hover:text-amber-400'}`}
                        >
                          <Star className="w-4 h-4" fill={inWatch ? 'currentColor' : 'none'} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
