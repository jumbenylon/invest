import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req)

    // Get default portfolio
    const portfolios = await query(
      'SELECT * FROM portfolios WHERE user_id = ? ORDER BY is_default DESC LIMIT 1',
      [user.userId]
    )
    const portfolio = portfolios.rows[0] as any

    // Total investment value
    const investResult = await query(
      `SELECT
        SUM(quantity * current_price) as total_value,
        SUM(quantity * buy_price) as total_cost,
        COUNT(*) as total_assets
       FROM investments WHERE user_id = ?`,
      [user.userId]
    )
    const investStats = investResult.rows[0] as any

    // Monthly income vs expense (current month)
    const txResult = await query(
      `SELECT
        type,
        SUM(amount) as total
       FROM transactions
       WHERE user_id = ? AND MONTH(date) = MONTH(NOW()) AND YEAR(date) = YEAR(NOW())
       GROUP BY type`,
      [user.userId]
    )
    let monthlyIncome = 0, monthlyExpense = 0
    for (const row of txResult.rows as any[]) {
      if (row.type === 'income') monthlyIncome = parseFloat(row.total) || 0
      if (row.type === 'expense') monthlyExpense = parseFloat(row.total) || 0
    }

    // Active loans
    const loanResult = await query(
      'SELECT SUM(balance) as total_debt, COUNT(*) as loan_count FROM loans WHERE user_id = ? AND status = "active"',
      [user.userId]
    )
    const loanStats = loanResult.rows[0] as any

    // Goals
    const goalResult = await query(
      'SELECT COUNT(*) as count, SUM(current_amount) as saved, SUM(target_amount) as target FROM goals WHERE user_id = ? AND status = "active"',
      [user.userId]
    )
    const goalStats = goalResult.rows[0] as any

    // Recent transactions (last 5)
    const recentTx = await query(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, created_at DESC LIMIT 5',
      [user.userId]
    )

    // Portfolio breakdown by category
    const categoryBreakdown = await query(
      `SELECT category, SUM(quantity * current_price) as value
       FROM investments WHERE user_id = ?
       GROUP BY category`,
      [user.userId]
    )

    const totalValue = parseFloat(investStats?.total_value) || 0
    const totalCost = parseFloat(investStats?.total_cost) || 0
    const totalDebt = parseFloat(loanStats?.total_debt) || 0
    const netWorth = totalValue + monthlyIncome - monthlyExpense - totalDebt

    return NextResponse.json({
      netWorth,
      portfolio: {
        totalValue,
        totalCost,
        gainLoss: totalValue - totalCost,
        gainLossPct: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
        totalAssets: parseInt(investStats?.total_assets) || 0,
        breakdown: categoryBreakdown.rows,
      },
      cashflow: {
        monthlyIncome,
        monthlyExpense,
        netCashflow: monthlyIncome - monthlyExpense,
      },
      loans: {
        totalDebt,
        loanCount: parseInt(loanStats?.loan_count) || 0,
      },
      goals: {
        count: parseInt(goalStats?.count) || 0,
        saved: parseFloat(goalStats?.saved) || 0,
        target: parseFloat(goalStats?.target) || 0,
      },
      recentTransactions: recentTx.rows,
    })
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Dashboard error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
