import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req)

    const result = await query(
      `SELECT w.*,
        COALESCE(d.last_price, u.nav) as current_price,
        COALESCE(d.change_pct, u.change_pct) as change_pct,
        COALESCE(d.name, u.name) as market_name
       FROM watchlist w
       LEFT JOIN dse_stocks d ON d.symbol = w.symbol AND w.type = 'DSE'
       LEFT JOIN utt_funds u ON u.symbol = w.symbol AND w.type = 'UTT'
       WHERE w.user_id = ?
       ORDER BY w.type, w.symbol`,
      [user.userId]
    )

    return NextResponse.json({ watchlist: result.rows })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req)
    const { symbol, type, alert_price } = await req.json()

    const id = crypto.randomUUID()
    await query(
      'INSERT IGNORE INTO watchlist (id, user_id, symbol, type, alert_price) VALUES (?, ?, ?, ?, ?)',
      [id, user.userId, symbol, type, alert_price || null]
    )

    return NextResponse.json({ message: 'Added to watchlist' }, { status: 201 })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = requireAuth(req)
    const { searchParams } = new URL(req.url)
    const symbol = searchParams.get('symbol')
    const type = searchParams.get('type')

    await query('DELETE FROM watchlist WHERE user_id = ? AND symbol = ? AND type = ?', [user.userId, symbol, type])
    return NextResponse.json({ message: 'Removed from watchlist' })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
