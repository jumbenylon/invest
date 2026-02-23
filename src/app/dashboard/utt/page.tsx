'use client'
import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Star, Shield, Loader2 } from 'lucide-react'

function fmt(n: number, decimals = 2) {
  return new Intl.NumberFormat('en-TZ', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n || 0)
}

function apiHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('invest_token') : ''
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

const riskColors: Record<string, string> = {
  low: 'bg-[#00b359]/10 text-[#00b359]',
  medium: 'bg-amber-500/10 text-amber-400',
  high: 'bg-[#e63946]/10 text-[#e63946]',
}

export default function UTTPage() {
  const [funds, setFunds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set())

  async function load() {
    setLoading(true)
    const [fRes, wRes] = await Promise.all([
      fetch('/api/utt/funds', { headers: apiHeaders() }),
      fetch('/api/watchlist', { headers: apiHeaders() }),
    ])
    const fData = await fRes.json()
    const wData = await wRes.json()
    setFunds(fData.funds || [])
    const wSet = new Set<string>((wData.watchlist || []).filter((w: any) => w.type === 'UTT').map((w: any) => w.symbol))
    setWatchlist(wSet)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleWatch(symbol: string) {
    if (watchlist.has(symbol)) {
      await fetch(`/api/watchlist?symbol=${symbol}&type=UTT`, { method: 'DELETE', headers: apiHeaders() })
      setWatchlist(w => { const n = new Set(w); n.delete(symbol); return n })
    } else {
      await fetch('/api/watchlist', { method: 'POST', headers: apiHeaders(), body: JSON.stringify({ symbol, type: 'UTT' }) })
      setWatchlist(w => new Set([...w, symbol]))
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">UTT Funds</h1>
        <p className="text-[#8b8fa8] text-sm">Unit Trust of Tanzania investment products</p>
      </div>

      {/* Info Banner */}
      <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-4 flex gap-3">
        <Shield className="w-5 h-5 text-[#00b359] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium">UTT funds are regulated by CMSA Tanzania</p>
          <p className="text-xs text-[#8b8fa8] mt-0.5">NAV prices updated from UTT official data. Minimum investment varies per fund.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#ff1a66]" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {funds.map(fund => {
            const chg = parseFloat(fund.change_pct)
            const inWatch = watchlist.has(fund.symbol)
            return (
              <div key={fund.symbol} className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-5 hover:border-[#ff1a66]/20 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[#ff1a66] font-bold">{fund.symbol}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${riskColors[fund.risk_level] || 'bg-[#2a2d3a] text-[#8b8fa8]'}`}>
                        {fund.risk_level?.toUpperCase()} RISK
                      </span>
                    </div>
                    <p className="font-semibold">{fund.name}</p>
                    <p className="text-[#8b8fa8] text-xs">{fund.fund_type}</p>
                  </div>
                  <button
                    onClick={() => toggleWatch(fund.symbol)}
                    className={`p-1.5 rounded-lg transition-colors ${inWatch ? 'text-amber-400 bg-amber-400/10' : 'text-[#8b8fa8] hover:text-amber-400'}`}
                  >
                    <Star className="w-4 h-4" fill={inWatch ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-[#8b8fa8] text-xs mb-0.5">NAV (TZS)</p>
                    <p className="text-lg font-bold">{fmt(fund.nav, 2)}</p>
                    <div className={`flex items-center gap-1 text-xs font-medium mt-0.5 ${chg >= 0 ? 'text-[#00b359]' : 'text-[#e63946]'}`}>
                      {chg >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {chg >= 0 ? '+' : ''}{chg.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <p className="text-[#8b8fa8] text-xs mb-0.5">Min Investment</p>
                    <p className="text-sm font-semibold">TZS {fmt(fund.min_investment, 0)}</p>
                  </div>
                </div>

                {fund.description && (
                  <p className="text-xs text-[#8b8fa8] leading-relaxed border-t border-[#2a2d3a] pt-3">
                    {fund.description}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
