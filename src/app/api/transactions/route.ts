import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req)
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let sql = 'SELECT * FROM transactions WHERE user_id = ?'
    const params: any[] = [user.userId]

    if (type) { sql += ' AND type = ?'; params.push(type) }
    if (category) { sql += ' AND category = ?'; params.push(category) }
    if (from) { sql += ' AND date >= ?'; params.push(from) }
    if (to) { sql += ' AND date <= ?'; params.push(to) }

    sql += ' ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const result = await query(sql, params)

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM transactions WHERE user_id = ?'
    const countParams: any[] = [user.userId]
    if (type) { countSql += ' AND type = ?'; countParams.push(type) }
    if (category) { countSql += ' AND category = ?'; countParams.push(category) }
    if (from) { countSql += ' AND date >= ?'; countParams.push(from) }
    if (to) { countSql += ' AND date <= ?'; countParams.push(to) }

    const countResult = await query(countSql, countParams)
    const total = (countResult.rows[0] as any).total

    return NextResponse.json({ transactions: result.rows, total })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('Transactions GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req)
    const body = await req.json()
    const { date, description, amount, category, type, portfolio_id, reference } = body

    if (!date || !description || !amount || !type) {
      return NextResponse.json({ error: 'date, description, amount and type are required' }, { status: 400 })
    }

    const id = crypto.randomUUID()
    await query(
      `INSERT INTO transactions (id, user_id, portfolio_id, date, description, amount, category, type, reference)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, user.userId, portfolio_id || null, date, description, amount, category || 'General', type, reference || null]
    )

    return NextResponse.json({ id, message: 'Transaction added' }, { status: 201 })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('Transactions POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = requireAuth(req)
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    await query('DELETE FROM transactions WHERE id = ? AND user_id = ?', [id, user.userId])
    return NextResponse.json({ message: 'Transaction deleted' })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
