'use client'
import { useEffect, useState } from 'react'
import { Plus, ArrowUpRight, ArrowDownRight, Search, Filter, Trash2, Loader2 } from 'lucide-react'

const TX_TYPES = ['income', 'expense', 'investment', 'repayment', 'transfer']
const CATEGORIES = ['Salary', 'Business', 'Dividends', 'Food', 'Transport', 'Utilities', 'Healthcare', 'Education', 'Entertainment', 'Investment', 'Loan', 'Transfer', 'Other']

function fmt(n: number) {
  return new Intl.NumberFormat('en-TZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n || 0)
}

function apiHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('invest_token') : ''
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], description: '', amount: '', category: 'Other', type: 'expense' })

  async function load() {
    setLoading(true)
    const params = new URLSearchParams({ limit: '100' })
    if (filterType) params.set('type', filterType)
    const res = await fetch(`/api/transactions?${params}`, { headers: apiHeaders() })
    const data = await res.json()
    setTransactions(data.transactions || [])
    setTotal(data.total || 0)
    setLoading(false)
  }

  useEffect(() => { load() }, [filterType])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: apiHeaders(),
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    })
    if (res.ok) { setShowForm(false); setForm({ date: new Date().toISOString().split('T')[0], description: '', amount: '', category: 'Other', type: 'expense' }); load() }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this transaction?')) return
    await fetch(`/api/transactions?id=${id}`, { method: 'DELETE', headers: apiHeaders() })
    load()
  }

  const filtered = transactions.filter(tx =>
    !search || tx.description.toLowerCase().includes(search.toLowerCase()) || tx.category.toLowerCase().includes(search.toLowerCase())
  )

  const monthIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0)
  const monthExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0)

  const typeColors: Record<string, string> = {
    income: 'text-[#00b359]', expense: 'text-[#e63946]',
    investment: 'text-[#ff1a66]', repayment: 'text-amber-400', transfer: 'text-blue-400',
  }
  const typeIcons: Record<string, any> = {
    income: ArrowUpRight, expense: ArrowDownRight, investment: ArrowUpRight,
    repayment: ArrowDownRight, transfer: ArrowUpRight,
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-[#8b8fa8] text-sm">Your financial ledger</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#ff1a66] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#00b359]/10 border border-[#00b359]/20 rounded-xl p-4">
          <p className="text-[#00b359] text-xs mb-1">Income</p>
          <p className="text-xl font-bold text-[#00b359]">TZS {fmt(monthIncome)}</p>
        </div>
        <div className="bg-[#e63946]/10 border border-[#e63946]/20 rounded-xl p-4">
          <p className="text-[#e63946] text-xs mb-1">Expenses</p>
          <p className="text-xl font-bold text-[#e63946]">TZS {fmt(monthExpense)}</p>
        </div>
        <div className={`border rounded-xl p-4 ${monthIncome - monthExpense >= 0 ? 'bg-[#1a1d27] border-[#2a2d3a]' : 'bg-[#e63946]/10 border-[#e63946]/20'}`}>
          <p className="text-[#8b8fa8] text-xs mb-1">Net</p>
          <p className={`text-xl font-bold ${monthIncome - monthExpense >= 0 ? 'text-[#00b359]' : 'text-[#e63946]'}`}>
            TZS {fmt(monthIncome - monthExpense)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b8fa8]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..."
            className="w-full bg-[#1a1d27] border border-[#2a2d3a] rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#ff1a66]" />
        </div>
        <div className="flex gap-2">
          {['', ...TX_TYPES].map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${filterType === t ? 'bg-[#ff1a66] text-white' : 'bg-[#1a1d27] border border-[#2a2d3a] text-[#8b8fa8] hover:text-white'}`}>
              {t || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#ff1a66]" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[#8b8fa8]">No transactions found.</div>
      ) : (
        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl divide-y divide-[#2a2d3a]">
          {filtered.map(tx => {
            const Icon = typeIcons[tx.type] || ArrowUpRight
            return (
              <div key={tx.id} className="flex items-center gap-4 px-4 py-3 hover:bg-[#2a2d3a]/20">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${tx.type === 'income' ? 'bg-[#00b359]/10' : 'bg-[#e63946]/10'}`}>
                  <Icon className={`w-4 h-4 ${typeColors[tx.type]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tx.description}</p>
                  <p className="text-xs text-[#8b8fa8]">{tx.category} · {tx.date?.split('T')[0]}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-semibold ${typeColors[tx.type]}`}>
                    {['income', 'investment', 'transfer'].includes(tx.type) ? '+' : '-'}TZS {fmt(tx.amount)}
                  </p>
                  <p className="text-xs text-[#8b8fa8] capitalize">{tx.type}</p>
                </div>
                <button onClick={() => handleDelete(tx.id)} className="text-[#8b8fa8] hover:text-[#e63946] flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl w-full max-w-md p-6">
            <h2 className="font-bold text-lg mb-4">Add Transaction</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#ff1a66]">
                    {TX_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#ff1a66]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required
                  className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#ff1a66]"
                  placeholder="e.g. Salary from company" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Amount (TZS)</label>
                  <input type="number" step="any" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#ff1a66]" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#ff1a66]">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-[#2a2d3a] text-[#8b8fa8] py-2.5 rounded-lg text-sm hover:bg-[#2a2d3a]">Cancel</button>
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
