'use client'
import { useEffect, useState } from 'react'
import { Star, TrendingUp, TrendingDown, Trash2, Loader2 } from 'lucide-react'

function fmt(n: number) {
  return new Intl.NumberFormat('en-TZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0)
}

function apiHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('invest_token') : ''
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/watchlist', { headers: apiHeaders() })
    const data = await res.json()
    setWatchlist(data.watchlist || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleRemove(symbol: string, type: string) {
    await fetch(`/api/watchlist?symbol=${symbol}&type=${type}`, { method: 'DELETE', headers: apiHeaders() })
    setWatchlist(w => w.filter(i => !(i.symbol === symbol && i.type === type)))
  }

  const dse = watchlist.filter(w => w.type === 'DSE')
  const utt = watchlist.filter(w => w.type === 'UTT')

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Watchlist</h1>
        <p className="text-[#8b8fa8] text-sm">Stocks and funds you&apos;re tracking</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#ff1a66]" /></div>
      ) : watchlist.length === 0 ? (
        <div className="text-center py-16 text-[#8b8fa8]">
          <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No items in watchlist</p>
          <p className="text-sm mt-1">Star stocks on the DSE or UTT pages to track them here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {dse.length > 0 && (
            <div>
              <h2 className="font-semibold mb-3 text-sm text-[#8b8fa8] uppercase tracking-wide">DSE Stocks ({dse.length})</h2>
              <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl overflow-hidden">
                {dse.map((item, idx) => {
                  const chg = parseFloat(item.change_pct)
                  return (
                    <div key={item.id} className={`flex items-center gap-4 px-4 py-3 hover:bg-[#2a2d3a]/20 ${idx < dse.length - 1 ? 'border-b border-[#2a2d3a]' : ''}`}>
                      <div className="w-9 h-9 bg-[#ff1a66]/10 rounded-lg flex items-center justify-center text-xs font-bold text-[#ff1a66] flex-shrink-0">
                        {item.symbol.substring(0, 3)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{item.symbol}</p>
                        <p className="text-xs text-[#8b8fa8] truncate">{item.market_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-medium">TZS {fmt(item.current_price)}</p>
                        <div className={`flex items-center justify-end gap-1 text-xs font-medium ${chg >= 0 ? 'text-[#00b359]' : 'text-[#e63946]'}`}>
                          {chg >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {chg >= 0 ? '+' : ''}{chg.toFixed(2)}%
                        </div>
                      </div>
                      <button onClick={() => handleRemove(item.symbol, 'DSE')} className="text-[#8b8fa8] hover:text-[#e63946] ml-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {utt.length > 0 && (
            <div>
              <h2 className="font-semibold mb-3 text-sm text-[#8b8fa8] uppercase tracking-wide">UTT Funds ({utt.length})</h2>
              <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl overflow-hidden">
                {utt.map((item, idx) => {
                  const chg = parseFloat(item.change_pct)
                  return (
                    <div key={item.id} className={`flex items-center gap-4 px-4 py-3 hover:bg-[#2a2d3a]/20 ${idx < utt.length - 1 ? 'border-b border-[#2a2d3a]' : ''}`}>
                      <div className="w-9 h-9 bg-[#00b359]/10 rounded-lg flex items-center justify-center text-xs font-bold text-[#00b359] flex-shrink-0">
                        {item.symbol.substring(0, 3)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{item.symbol}</p>
                        <p className="text-xs text-[#8b8fa8] truncate">{item.market_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-medium">TZS {fmt(item.current_price)}</p>
                        <div className={`flex items-center justify-end gap-1 text-xs font-medium ${chg >= 0 ? 'text-[#00b359]' : 'text-[#e63946]'}`}>
                          {chg >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {chg >= 0 ? '+' : ''}{chg.toFixed(2)}%
                        </div>
                      </div>
                      <button onClick={() => handleRemove(item.symbol, 'UTT')} className="text-[#8b8fa8] hover:text-[#e63946] ml-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
