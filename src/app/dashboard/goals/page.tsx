'use client'
import { useEffect, useState } from 'react'
import { Plus, Target, Loader2, Trophy } from 'lucide-react'

function fmt(n: number) {
  return new Intl.NumberFormat('en-TZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n || 0)
}

function daysLeft(targetDate: string) {
  if (!targetDate) return null
  const diff = new Date(targetDate).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function apiHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('invest_token') : ''
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

const GOAL_COLORS = ['#ff1a66', '#00b359', '#f4a261', '#8b5cf6', '#3b82f6', '#f59e0b', '#ec4899']

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [depositId, setDepositId] = useState<string | null>(null)
  const [depositAmt, setDepositAmt] = useState('')
  const [form, setForm] = useState({ name: '', target_amount: '', current_amount: '0', target_date: '', category: 'General', color: '#ff1a66' })

  async function load() {
    setLoading(true)
    const res = await fetch('/api/goals', { headers: apiHeaders() })
    const data = await res.json()
    setGoals(data.goals || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: apiHeaders(),
      body: JSON.stringify({ ...form, target_amount: parseFloat(form.target_amount), current_amount: parseFloat(form.current_amount || '0') }),
    })
    if (res.ok) { setShowForm(false); load() }
    setSaving(false)
  }

  async function handleDeposit(goal: any) {
    if (!depositAmt) return
    const newAmt = parseFloat(goal.current_amount) + parseFloat(depositAmt)
    await fetch('/api/goals', {
      method: 'PUT',
      headers: apiHeaders(),
      body: JSON.stringify({ ...goal, current_amount: newAmt, status: newAmt >= parseFloat(goal.target_amount) ? 'completed' : 'active' }),
    })
    setDepositId(null)
    setDepositAmt('')
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this goal?')) return
    await fetch(`/api/goals?id=${id}`, { method: 'DELETE', headers: apiHeaders() })
    load()
  }

  const active = goals.filter(g => g.status === 'active')
  const completed = goals.filter(g => g.status === 'completed')

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financial Goals</h1>
          <p className="text-[#8b8fa8] text-sm">Track progress toward your dreams</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#ff1a66] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90">
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#ff1a66]" /></div>
      ) : goals.length === 0 ? (
        <div className="text-center py-16 text-[#8b8fa8]">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No goals yet. Set your first financial goal!</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div>
              <h2 className="font-semibold mb-4 text-sm text-[#8b8fa8] uppercase tracking-wide">Active Goals ({active.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {active.map(goal => {
                  const pct = Math.min(100, (parseFloat(goal.current_amount) / parseFloat(goal.target_amount)) * 100)
                  const days = daysLeft(goal.target_date)
                  const isDepositing = depositId === goal.id
                  return (
                    <div key={goal.id} className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${goal.color}20` }}>
                          <Target className="w-5 h-5" style={{ color: goal.color }} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{goal.name}</p>
                          <p className="text-xs text-[#8b8fa8]">{goal.category}</p>
                        </div>
                        {days !== null && (
                          <span className={`text-xs px-2 py-1 rounded-full ${days < 30 ? 'bg-[#e63946]/10 text-[#e63946]' : 'bg-[#2a2d3a] text-[#8b8fa8]'}`}>
                            {days > 0 ? `${days}d left` : 'Overdue'}
                          </span>
                        )}
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1.5">
                          <span>TZS {fmt(goal.current_amount)}</span>
                          <span className="text-[#8b8fa8]">/ TZS {fmt(goal.target_amount)}</span>
                        </div>
                        <div className="h-3 bg-[#2a2d3a] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: goal.color }} />
                        </div>
                        <p className="text-xs text-[#8b8fa8] mt-1 text-right">{pct.toFixed(1)}%</p>
                      </div>

                      {isDepositing ? (
                        <div className="flex gap-2">
                          <input type="number" placeholder="Amount to add" value={depositAmt} onChange={e => setDepositAmt(e.target.value)}
                            className="flex-1 bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#ff1a66]" />
                          <button onClick={() => handleDeposit(goal)} className="bg-[#00b359] text-white px-3 py-2 rounded-lg text-xs font-medium">Add</button>
                          <button onClick={() => setDepositId(null)} className="text-[#8b8fa8] px-2 text-xs">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button onClick={() => { setDepositId(goal.id); setDepositAmt('') }}
                            className="flex-1 text-center border border-[#2a2d3a] text-sm py-1.5 rounded-lg hover:bg-[#2a2d3a] transition-colors" style={{ borderColor: goal.color, color: goal.color }}>
                            + Add Savings
                          </button>
                          <button onClick={() => handleDelete(goal.id)} className="text-[#8b8fa8] hover:text-[#e63946] text-xs border border-[#2a2d3a] px-3 rounded-lg">
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <h2 className="font-semibold mb-4 text-sm text-[#00b359] uppercase tracking-wide">Completed ({completed.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completed.map(goal => (
                  <div key={goal.id} className="bg-[#00b359]/5 border border-[#00b359]/20 rounded-xl p-5 flex items-center gap-4">
                    <Trophy className="w-8 h-8 text-[#00b359] flex-shrink-0" />
                    <div>
                      <p className="font-semibold">{goal.name}</p>
                      <p className="text-sm text-[#00b359]">TZS {fmt(goal.target_amount)} reached!</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Goal Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl w-full max-w-md p-6">
            <h2 className="font-bold text-lg mb-4">New Goal</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Goal Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                  className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#ff1a66]"
                  placeholder="e.g. Buy a car, Emergency fund..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Target (TZS)</label>
                  <input type="number" value={form.target_amount} onChange={e => setForm(f => ({ ...f, target_amount: e.target.value }))} required
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#ff1a66]" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Current Savings</label>
                  <input type="number" value={form.current_amount} onChange={e => setForm(f => ({ ...f, current_amount: e.target.value }))}
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#ff1a66]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Date (optional)</label>
                <input type="date" value={form.target_date} onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))}
                  className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#ff1a66]" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <div className="flex gap-2">
                  {GOAL_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                      className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#0f1117]' : ''}`}
                      style={{ background: c }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-[#2a2d3a] text-[#8b8fa8] py-2.5 rounded-lg text-sm hover:bg-[#2a2d3a]">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-[#ff1a66] text-white py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-3 h-3 animate-spin" />} Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
