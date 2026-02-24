// GET /api/admin/sync-prices          — returns current prices
// POST /api/admin/sync-prices?key=... — bulk update DSE/UTT prices
// Called by cron or admin dashboard to keep prices fresh

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

const SYNC_KEY = process.env.SYNC_KEY || 'invest_sync_2026'

export async function GET() {
  const [dse, utt] = await Promise.all([
    query('SELECT symbol, name, last_price, change_pct, change_amount, updated_at FROM dse_stocks ORDER BY symbol'),
    query('SELECT symbol, name, nav, change_pct, updated_at FROM utt_funds ORDER BY symbol'),
  ])
  return NextResponse.json({ dse: dse.rows, utt: utt.rows, updated_at: new Date().toISOString() })
}

export async function POST(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key')
  if (key !== SYNC_KEY) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { stocks = [], funds = [] } = body

  let stocksUpdated = 0
  let fundsUpdated = 0

  // Update DSE stocks
  for (const s of stocks) {
    if (!s.symbol || s.last_price == null) continue
    const prev = await query('SELECT last_price FROM dse_stocks WHERE symbol = ?', [s.symbol])
    const prevPrice = prev.rows[0]?.last_price ?? s.last_price
    const change = parseFloat(s.last_price) - parseFloat(prevPrice)
    const changePct = parseFloat(prevPrice) > 0 ? ((change / parseFloat(prevPrice)) * 100).toFixed(2) : '0.00'

    await query(
      `UPDATE dse_stocks SET
        last_price   = ?,
        change_amount = ?,
        change_pct   = ?,
        updated_at   = NOW()
       WHERE symbol = ?`,
      [s.last_price, change.toFixed(2), s.change_pct ?? changePct, s.symbol]
    )
    stocksUpdated++
  }

  // Update UTT funds
  for (const f of funds) {
    if (!f.symbol || f.nav == null) continue
    await query(
      `UPDATE utt_funds SET
        nav        = ?,
        change_pct = ?,
        updated_at = NOW()
       WHERE symbol = ?`,
      [f.nav, f.change_pct ?? 0, f.symbol]
    )
    fundsUpdated++
  }

  return NextResponse.json({
    ok: true,
    stocksUpdated,
    fundsUpdated,
    note: 'To automate: schedule GET https://invest.sakuragroup.co.tz/api/admin/sync-prices every weekday at 18:00 EAT after DSE market close (15:30). DSE publishes daily closing prices at dse.co.tz/market-statistics',
  })
}
