import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { canAddAsset } from '@/lib/subscription'

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req)
    const { searchParams } = new URL(req.url)
    const portfolioId = searchParams.get('portfolioId')

    let sql = `
      SELECT i.*, p.name as portfolio_name
      FROM investments i
      JOIN portfolios p ON p.id = i.portfolio_id
      WHERE i.user_id = ?
    `
    const params: any[] = [user.userId]

    if (portfolioId) {
      sql += ' AND i.portfolio_id = ?'
      params.push(portfolioId)
    }

    sql += ' ORDER BY i.category, i.name'

    const result = await query(sql, params)

    // Enrich DSE/UTT with current market prices
    const investments = result.rows as any[]
    const symbols = investments.filter(i => ['DSE', 'UTT'].includes(i.category)).map(i => i.symbol).filter(Boolean)

    if (symbols.length > 0) {
      const dseSymbols = investments.filter(i => i.category === 'DSE' && i.symbol).map(i => i.symbol)
      const uttSymbols = investments.filter(i => i.category === 'UTT' && i.symbol).map(i => i.symbol)

      if (dseSymbols.length > 0) {
        const prices = await query(
          `SELECT symbol, last_price FROM dse_stocks WHERE symbol IN (${dseSymbols.map(() => '?').join(',')})`,
          dseSymbols
        )
        const priceMap = Object.fromEntries((prices.rows as any[]).map(p => [p.symbol, p.last_price]))
        investments.forEach(i => {
          if (i.category === 'DSE' && priceMap[i.symbol]) {
            i.current_price = parseFloat(priceMap[i.symbol])
          }
        })
      }

      if (uttSymbols.length > 0) {
        const prices = await query(
          `SELECT symbol, nav FROM utt_funds WHERE symbol IN (${uttSymbols.map(() => '?').join(',')})`,
          uttSymbols
        )
        const priceMap = Object.fromEntries((prices.rows as any[]).map(p => [p.symbol, p.nav]))
        investments.forEach(i => {
          if (i.category === 'UTT' && priceMap[i.symbol]) {
            i.current_price = parseFloat(priceMap[i.symbol])
          }
        })
      }
    }

    return NextResponse.json({ investments })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('Portfolio GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req)
    const body = await req.json()
    const { portfolio_id, category, symbol, name, quantity, buy_price, current_price, buy_date, notes } = body

    // Check asset limit
    const countResult = await query('SELECT COUNT(*) as c FROM investments WHERE user_id = ?', [user.userId])
    const count = (countResult.rows[0] as any).c
    if (!canAddAsset(user.plan, count)) {
      return NextResponse.json({ error: 'Asset limit reached. Upgrade to Pro for unlimited assets.' }, { status: 403 })
    }

    // Verify portfolio belongs to user
    const portResult = await query('SELECT id FROM portfolios WHERE id = ? AND user_id = ?', [portfolio_id, user.userId])
    if (portResult.rowCount === 0) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    const id = crypto.randomUUID()
    await query(
      `INSERT INTO investments (id, portfolio_id, user_id, category, symbol, name, quantity, buy_price, current_price, buy_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, portfolio_id, user.userId, category, symbol || null, name, quantity, buy_price, current_price || buy_price, buy_date || null, notes || null]
    )

    return NextResponse.json({ id, message: 'Investment added' }, { status: 201 })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('Portfolio POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = requireAuth(req)
    const body = await req.json()
    const { id, quantity, current_price, buy_price, buy_date, notes } = body

    await query(
      `UPDATE investments SET quantity = ?, current_price = ?, buy_price = ?, buy_date = ?, notes = ?, updated_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [quantity, current_price, buy_price, buy_date || null, notes || null, id, user.userId]
    )

    return NextResponse.json({ message: 'Investment updated' })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = requireAuth(req)
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    await query('DELETE FROM investments WHERE id = ? AND user_id = ?', [id, user.userId])
    return NextResponse.json({ message: 'Investment deleted' })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
