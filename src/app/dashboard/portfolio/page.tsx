'use client'
import { useEffect, useState } from 'react'
import { Plus, TrendingUp, TrendingDown, Trash2, Loader2 } from 'lucide-react'

const CATEGORIES = ['DSE', 'UTT', 'VEHICLE', 'LAND', 'CASH', 'BOND', 'OTHER']

function fmt(n: number) {
  return new Intl.NumberFormat('en-TZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n || 0)
}

function apiHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('invest_token') : ''
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

export default function PortfolioPage() {
  const [investments, setInvestments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [portfolioId, setPortfolioId] = useState('')
  const [form, setForm] = useState({ category: 'DSE', symbol: '', name: '', quantity: '', buy_price: '', current_price: '', buy_date: '' })
  const [saving, setSaving] = useState(false)
  const [filterCat, setFilterCat] = useState('ALL')

  async function load() {
    setLoading(true)
    const res = await fetch('/api/portfolio', { headers: apiHeaders() })
    const data = await res.json()
    setInvestments(data.investments || [])

    // Get default portfolio id
    const userRes = await fetch('/api/portfolio', { headers: apiHeaders() })
    if (data.investments?.[0]) setPortfolioId(data.investments[0].portfolio_id)
    setLoading(false)
  }

  async function loadPortfolio() {
    const res = await fetch('/api/dashboard', { headers: apiHeaders() })
    // We just need any portfolio_id — get it from first investment or we'll add it on save
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    // Get portfolio id from first investment or create one
    let pid = portfolioId
    if (!pid && investments.length === 0) {
      // Fetch from server
      const r = await fetch('/api/dashboard', { headers: apiHeaders() })
      const d = await r.json()
      pid = d?.portfolio?.id || ''
    }

    const res = await fetch('/api/portfolio', {
      method: 'POST',
      headers: apiHeaders(),
      body: JSON.stringify({ ...form, portfolio_id: pid, quantity: parseFloat(form.quantity), buy_price: parseFloat(form.buy_price), current_price: parseFloat(form.current_price || form.buy_price) }),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ category: 'DSE', symbol: '', name: '', quantity: '', buy_price: '', current_price: '', buy_date: '' })
      load()
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this investment?')) return
    await fetch(`/api/portfolio?id=${id}`, { method: 'DELETE', headers: apiHeaders() })
    load()
  }

  const filtered = filterCat === 'ALL' ? investments : investments.filter(i => i.category === filterCat)
  const totalValue = investments.reduce((s, i) => s + (parseFloat(i.quantity) * parseFloat(i.current_price)), 0)
  const totalCost = investments.reduce((s, i) => s + (parseFloat(i.quantity) * parseFloat(i.buy_price)), 0)
  const totalGain = totalValue - totalCost

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-[#8b8fa8] text-sm">All your investment holdings</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#ff1a66] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90">
          <Plus className="w-4 h-4" /> Add Holding
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-4">
          <p className="text-[#8b8fa8] text-xs mb-1">Total Value</p>
          <p className="text-xl font-bold">TZS {fmt(totalValue)}</p>
        </div>
        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-4">
          <p className="text-[#8b8fa8] text-xs mb-1">Total Cost</p>
          <p className="text-xl font-bold">TZS {fmt(totalCost)}</p>
        </div>
        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-4">
          <p className="text-[#8b8fa8] text-xs mb-1">Gain / Loss</p>
          <p className={`text-xl font-bold ${totalGain >= 0 ? 'text-[#00b359]' : 'text-[#e63946]'}`}>
            {totalGain >= 0 ? '+' : ''}TZS {fmt(totalGain)}
          </p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', ...CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterCat === cat ? 'bg-[#ff1a66] text-white' : 'bg-[#1a1d27] border border-[#2a2d3a] text-[#8b8fa8] hover:text-white'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Holdings table */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#ff1a66]" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[#8b8fa8]">
          <p className="text-lg">No holdings yet</p>
          <p className="text-sm mt-1">Add your first DSE stock or UTT fund</p>
        </div>
      ) : (
        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2d3a]">
                  <th className="text-left px-4 py-3 text-[#8b8fa8] font-medium">Asset</th>
                  <th className="text-right px-4 py-3 text-[#8b8fa8] font-medium">Qty</th>
                  <th className="text-right px-4 py-3 text-[#8b8fa8] font-medium">Buy Price</th>
                  <th className="text-right px-4 py-3 text-[#8b8fa8] font-medium">Current</th>
                  <th className="text-right px-4 py-3 text-[#8b8fa8] font-medium">Value</th>
                  <th className="text-right px-4 py-3 text-[#8b8fa8] font-medium">P/L</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => {
                  const qty = parseFloat(inv.quantity)
                  const buyP = parseFloat(inv.buy_price)
                  const curP = parseFloat(inv.current_price)
                  const value = qty * curP
                  const cost = qty * buyP
                  const pl = value - cost
                  const plPct = cost > 0 ? (pl / cost) * 100 : 0
                  return (
                    <tr key={inv.id} className="border-b border-[#2a2d3a] last:border-0 hover:bg-[#2a2d3a]/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#ff1a66]/10 rounded-lg flex items-center justify-center text-xs font-bold text-[#ff1a66]">
                            {inv.symbol?.substring(0, 2) || inv.category?.substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium">{inv.symbol || inv.name}</p>
                            <p className="text-[#8b8fa8] text-xs">{inv.category} · {inv.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">{qty.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">{fmt(buyP)}</td>
                      <td className="px-4 py-3 text-right">{fmt(curP)}</td>
                      <td className="px-4 py-3 text-right font-medium">{fmt(value)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className={pl >= 0 ? 'text-[#00b359]' : 'text-[#e63946]'}>
                          <p className="font-medium">{pl >= 0 ? '+' : ''}{fmt(pl)}</p>
                          <p className="text-xs">{plPct >= 0 ? '+' : ''}{plPct.toFixed(1)}%</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDelete(inv.id)} className="text-[#8b8fa8] hover:text-[#e63946] transition-colors">
                          <Trash2 className="w-4 h-4" />
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

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl w-full max-w-md p-6">
            <h2 className="font-bold text-lg mb-4">Add Investment</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#ff1a66]">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              {['DSE', 'UTT'].includes(form.category) && (
                <div>
                  <label className="block text-sm font-medium mb-1">Symbol</label>
                  <input value={form.symbol} onChange={e => setForm(f => ({ ...f, symbol: e.target.value.toUpperCase() }))}
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#ff1a66]"
                    placeholder="e.g. CRDB" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                  className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#ff1a66]"
                  placeholder="Asset name" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input type="number" step="any" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} required
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#ff1a66]" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Buy Price (TZS)</label>
                  <input type="number" step="any" value={form.buy_price} onChange={e => setForm(f => ({ ...f, buy_price: e.target.value }))} required
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#ff1a66]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Buy Date</label>
                <input type="date" value={form.buy_date} onChange={e => setForm(f => ({ ...f, buy_date: e.target.value }))}
                  className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#ff1a66]" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-[#2a2d3a] text-[#8b8fa8] py-2.5 rounded-lg text-sm hover:bg-[#2a2d3a]">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-[#ff1a66] text-white py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-3 h-3 animate-spin" />} Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
