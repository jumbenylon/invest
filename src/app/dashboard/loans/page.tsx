'use client'
import { useEffect, useState } from 'react'
import { Plus, CreditCard, CheckCircle, AlertCircle, Loader2, ChevronDown } from 'lucide-react'

function fmt(n: number) {
  return new Intl.NumberFormat('en-TZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n || 0)
}

function apiHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('invest_token') : ''
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

export default function LoansPage() {
  const [loans, setLoans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [expandedLoan, setExpandedLoan] = useState<string | null>(null)
  const [loanPayments, setLoanPayments] = useState<Record<string, any[]>>({})
  const [form, setForm] = useState({ name: '', lender: '', principal: '', interest_rate: '', start_date: new Date().toISOString().split('T')[0], end_date: '', monthly_payment: '' })
  const [paymentForm, setPaymentForm] = useState<Record<string, { amount: string; principal: string; interest: string; date: string }>>({})

  async function load() {
    setLoading(true)
    const res = await fetch('/api/loans', { headers: apiHeaders() })
    const data = await res.json()
    if (data.error === 'Loan tracking requires Pro plan. Upgrade now.') {
      setError(data.error)
    } else {
      setLoans(data.loans || [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/loans', {
      method: 'POST',
      headers: apiHeaders(),
      body: JSON.stringify({ ...form, principal: parseFloat(form.principal), interest_rate: parseFloat(form.interest_rate), monthly_payment: form.monthly_payment ? parseFloat(form.monthly_payment) : null }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); } else { setShowForm(false); load() }
    setSaving(false)
  }

  async function loadPayments(loanId: string) {
    const res = await fetch(`/api/loans?loanId=${loanId}`, { headers: apiHeaders() })
    const data = await res.json()
    setLoanPayments(p => ({ ...p, [loanId]: data.payments || [] }))
  }

  async function recordPayment(loanId: string) {
    const pf = paymentForm[loanId]
    if (!pf?.amount) return
    await fetch('/api/loans', {
      method: 'PUT',
      headers: apiHeaders(),
      body: JSON.stringify({ payment: { loan_id: loanId, date: pf.date || new Date().toISOString().split('T')[0], amount: parseFloat(pf.amount), principal_component: parseFloat(pf.principal || '0'), interest_component: parseFloat(pf.interest || '0') } }),
    })
    load()
    loadPayments(loanId)
    setPaymentForm(p => ({ ...p, [loanId]: { amount: '', principal: '', interest: '', date: new Date().toISOString().split('T')[0] } }))
  }

  const totalDebt = loans.filter(l => l.status === 'active').reduce((s, l) => s + parseFloat(l.balance), 0)
  const totalPrincipal = loans.filter(l => l.status === 'active').reduce((s, l) => s + parseFloat(l.principal), 0)

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Loans & Debt</h1>
          <p className="text-[#8b8fa8] text-sm">Track your debt and repayments</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#ff1a66] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90">
          <Plus className="w-4 h-4" /> Add Loan
        </button>
      </div>

      {error && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-3 rounded-lg text-sm flex gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {!error && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-[#e63946]/10 border border-[#e63946]/20 rounded-xl p-4">
              <p className="text-[#e63946] text-xs mb-1">Outstanding Balance</p>
              <p className="text-xl font-bold text-[#e63946]">TZS {fmt(totalDebt)}</p>
            </div>
            <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-4">
              <p className="text-[#8b8fa8] text-xs mb-1">Total Borrowed</p>
              <p className="text-xl font-bold">TZS {fmt(totalPrincipal)}</p>
            </div>
            <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-4">
              <p className="text-[#8b8fa8] text-xs mb-1">Active Loans</p>
              <p className="text-xl font-bold">{loans.filter(l => l.status === 'active').length}</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#ff1a66]" /></div>
          ) : loans.length === 0 ? (
            <div className="text-center py-16 text-[#8b8fa8]">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No loans tracked yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {loans.map(loan => {
                const balance = parseFloat(loan.balance)
                const principal = parseFloat(loan.principal)
                const paid = principal - balance
                const pct = principal > 0 ? (paid / principal) * 100 : 0
                const isExpanded = expandedLoan === loan.id
                const pf = paymentForm[loan.id] || { amount: '', principal: '', interest: '', date: new Date().toISOString().split('T')[0] }

                return (
                  <div key={loan.id} className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl overflow-hidden">
                    <div
                      className="flex items-center gap-4 p-5 cursor-pointer hover:bg-[#2a2d3a]/20"
                      onClick={() => { setExpandedLoan(isExpanded ? null : loan.id); if (!isExpanded) loadPayments(loan.id) }}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${loan.status === 'paid' ? 'bg-[#00b359]/10' : 'bg-[#e63946]/10'}`}>
                        {loan.status === 'paid' ? <CheckCircle className="w-5 h-5 text-[#00b359]" /> : <CreditCard className="w-5 h-5 text-[#e63946]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{loan.name}</p>
                          {loan.lender && <p className="text-xs text-[#8b8fa8]">· {loan.lender}</p>}
                          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${loan.status === 'paid' ? 'bg-[#00b359]/10 text-[#00b359]' : 'bg-[#e63946]/10 text-[#e63946]'}`}>
                            {loan.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-[#e63946] font-medium">TZS {fmt(balance)} left</span>
                          <span className="text-[#8b8fa8]">{loan.interest_rate}% p.a.</span>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-[#8b8fa8] mb-1">
                            <span>Paid: TZS {fmt(paid)}</span>
                            <span>{pct.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-[#2a2d3a] rounded-full overflow-hidden">
                            <div className="h-full bg-[#00b359] rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-[#8b8fa8] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>

                    {isExpanded && (
                      <div className="border-t border-[#2a2d3a] p-5 space-y-4">
                        {/* Record payment */}
                        {loan.status === 'active' && (
                          <div>
                            <p className="text-sm font-medium mb-3">Record Payment</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              <input type="date" value={pf.date} onChange={e => setPaymentForm(p => ({ ...p, [loan.id]: { ...pf, date: e.target.value } }))}
                                className="bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#ff1a66]" />
                              <input type="number" placeholder="Total amount" value={pf.amount} onChange={e => setPaymentForm(p => ({ ...p, [loan.id]: { ...pf, amount: e.target.value } }))}
                                className="bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#ff1a66]" />
                              <input type="number" placeholder="Principal portion" value={pf.principal} onChange={e => setPaymentForm(p => ({ ...p, [loan.id]: { ...pf, principal: e.target.value } }))}
                                className="bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#ff1a66]" />
                              <button onClick={() => recordPayment(loan.id)}
                                className="bg-[#00b359] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
                                Record
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Payment history */}
                        {loanPayments[loan.id]?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Payment History</p>
                            <div className="space-y-2">
                              {loanPayments[loan.id].map((p: any) => (
                                <div key={p.id} className="flex items-center justify-between text-sm bg-[#0f1117] rounded-lg px-3 py-2">
                                  <span className="text-[#8b8fa8]">{p.date?.split('T')[0]}</span>
                                  <span className="font-medium text-[#00b359]">TZS {fmt(p.amount)}</span>
                                  <span className="text-[#8b8fa8]">Balance: TZS {fmt(p.balance_after)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Add Loan Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl w-full max-w-md p-6">
            <h2 className="font-bold text-lg mb-4">Add Loan</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Loan Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                  className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#ff1a66]"
                  placeholder="e.g. CRDB Salary Loan" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Lender (optional)</label>
                <input value={form.lender} onChange={e => setForm(f => ({ ...f, lender: e.target.value }))}
                  className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#ff1a66]"
                  placeholder="Bank or individual name" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Principal (TZS)</label>
                  <input type="number" step="any" value={form.principal} onChange={e => setForm(f => ({ ...f, principal: e.target.value }))} required
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#ff1a66]" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Interest Rate (%)</label>
                  <input type="number" step="any" value={form.interest_rate} onChange={e => setForm(f => ({ ...f, interest_rate: e.target.value }))} required
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#ff1a66]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#ff1a66]" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Monthly Payment</label>
                  <input type="number" step="any" value={form.monthly_payment} onChange={e => setForm(f => ({ ...f, monthly_payment: e.target.value }))}
                    className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#ff1a66]" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-[#2a2d3a] text-[#8b8fa8] py-2.5 rounded-lg text-sm hover:bg-[#2a2d3a]">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-[#ff1a66] text-white py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-3 h-3 animate-spin" />} Add Loan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
