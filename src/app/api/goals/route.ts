import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { canAddGoal } from '@/lib/subscription'

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req)
    const result = await query(
      'SELECT * FROM goals WHERE user_id = ? ORDER BY status, target_date',
      [user.userId]
    )
    return NextResponse.json({ goals: result.rows })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req)

    const countResult = await query(
      'SELECT COUNT(*) as c FROM goals WHERE user_id = ? AND status = "active"',
      [user.userId]
    )
    const count = (countResult.rows[0] as any).c
    if (!canAddGoal(user.plan, count)) {
      return NextResponse.json({ error: 'Goal limit reached. Upgrade to Pro for unlimited goals.' }, { status: 403 })
    }

    const body = await req.json()
    const { name, target_amount, current_amount, target_date, category, icon, color } = body

    const id = crypto.randomUUID()
    await query(
      `INSERT INTO goals (id, user_id, name, target_amount, current_amount, target_date, category, icon, color)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, user.userId, name, target_amount, current_amount || 0, target_date || null, category || 'General', icon || null, color || '#ff1a66']
    )

    return NextResponse.json({ id, message: 'Goal created' }, { status: 201 })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = requireAuth(req)
    const body = await req.json()
    const { id, name, target_amount, current_amount, target_date, category, status } = body

    await query(
      `UPDATE goals SET name = ?, target_amount = ?, current_amount = ?, target_date = ?, category = ?, status = ?, updated_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [name, target_amount, current_amount, target_date || null, category, status || 'active', id, user.userId]
    )

    return NextResponse.json({ message: 'Goal updated' })
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
    await query('DELETE FROM goals WHERE id = ? AND user_id = ?', [id, user.userId])
    return NextResponse.json({ message: 'Goal deleted' })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
