'use client'
import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Target, CreditCard, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

function StatCard({ label, value, sub, trend, color }: any) {
  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-5">
      <p className="text-[#8b8fa8] text-xs font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color || 'text-white'}`}>{value}</p>
      {sub && <p className="text-[#8b8fa8] text-xs mt-1">{sub}</p>}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? 'text-[#00b359]' : 'text-[#e63946]'}`}>
          {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(trend).toFixed(2)}%
        </div>
      )}
    </div>
  )
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-TZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('invest_token')
    fetch('/api/dashboard', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#ff1a66] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const gainLoss = data?.portfolio?.gainLoss || 0
  const gainLossPct = data?.portfolio?.gainLossPct || 0

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-[#8b8fa8] text-sm mt-1">Your financial snapshot</p>
      </div>

      {/* Net Worth Hero */}
      <div className="bg-gradient-to-br from-[#ff1a66]/10 to-[#1a1d27] border border-[#ff1a66]/20 rounded-2xl p-6">
        <p className="text-[#8b8fa8] text-sm font-medium mb-1">Net Worth</p>
        <p className="text-4xl font-bold">TZS {fmt(data?.netWorth || 0)}</p>
        <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${gainLoss >= 0 ? 'text-[#00b359]' : 'text-[#e63946]'}`}>
          {gainLoss >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {gainLoss >= 0 ? '+' : ''}TZS {fmt(gainLoss)} ({gainLossPct.toFixed(2)}%) on investments
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Portfolio Value"
          value={`TZS ${fmt(data?.portfolio?.totalValue || 0)}`}
          sub={`${data?.portfolio?.totalAssets || 0} assets`}
          trend={gainLossPct}
        />
        <StatCard
          label="Monthly Income"
          value={`TZS ${fmt(data?.cashflow?.monthlyIncome || 0)}`}
          sub="This month"
          color="text-[#00b359]"
        />
        <StatCard
          label="Monthly Expenses"
          value={`TZS ${fmt(data?.cashflow?.monthlyExpense || 0)}`}
          sub="This month"
          color="text-[#e63946]"
        />
        <StatCard
          label="Total Debt"
          value={`TZS ${fmt(data?.loans?.totalDebt || 0)}`}
          sub={`${data?.loans?.loanCount || 0} active loans`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Breakdown */}
        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-5">
          <h2 className="font-semibold mb-4">Portfolio Breakdown</h2>
          {data?.portfolio?.breakdown?.length > 0 ? (
            <div className="space-y-3">
              {(data.portfolio.breakdown as any[]).map((item: any) => {
                const total = data.portfolio.totalValue || 1
                const pct = ((item.value / total) * 100).toFixed(1)
                const colors: Record<string, string> = {
                  DSE: '#ff1a66', UTT: '#00b359', VEHICLE: '#f4a261',
                  LAND: '#8b5cf6', CASH: '#3b82f6', BOND: '#f59e0b', OTHER: '#6b7280',
                }
                const color = colors[item.category] || '#6b7280'
                return (
                  <div key={item.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.category}</span>
                      <span className="text-[#8b8fa8]">{pct}% · TZS {fmt(item.value)}</span>
                    </div>
                    <div className="h-2 bg-[#2a2d3a] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-[#8b8fa8] text-sm text-center py-8">No investments yet. Add your first holding.</p>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-5">
          <h2 className="font-semibold mb-4">Recent Transactions</h2>
          {data?.recentTransactions?.length > 0 ? (
            <div className="space-y-3">
              {(data.recentTransactions as any[]).map((tx: any) => (
                <div key={tx.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${tx.type === 'income' ? 'bg-[#00b359]/10' : 'bg-[#e63946]/10'}`}>
                    {tx.type === 'income'
                      ? <ArrowUpRight className="w-4 h-4 text-[#00b359]" />
                      : <ArrowDownRight className="w-4 h-4 text-[#e63946]" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.description}</p>
                    <p className="text-xs text-[#8b8fa8]">{tx.category} · {tx.date?.split('T')[0]}</p>
                  </div>
                  <p className={`text-sm font-semibold flex-shrink-0 ${tx.type === 'income' ? 'text-[#00b359]' : 'text-[#e63946]'}`}>
                    {tx.type === 'income' ? '+' : '-'}TZS {fmt(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#8b8fa8] text-sm text-center py-8">No transactions yet.</p>
          )}
        </div>
      </div>

      {/* Goals Summary */}
      {data?.goals?.count > 0 && (
        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-5">
          <h2 className="font-semibold mb-2">Goals Progress</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#8b8fa8]">{data.goals.count} active goals</span>
                <span>TZS {fmt(data.goals.saved)} / {fmt(data.goals.target)}</span>
              </div>
              <div className="h-3 bg-[#2a2d3a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ff1a66] rounded-full"
                  style={{ width: `${Math.min(100, (data.goals.saved / data.goals.target) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
