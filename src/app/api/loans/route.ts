import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { canUseLoan } from '@/lib/subscription'

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req)
    const { searchParams } = new URL(req.url)
    const loanId = searchParams.get('loanId')

    if (loanId) {
      // Get loan with payments
      const loanResult = await query('SELECT * FROM loans WHERE id = ? AND user_id = ?', [loanId, user.userId])
      if (loanResult.rowCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

      const payments = await query(
        'SELECT * FROM loan_payments WHERE loan_id = ? ORDER BY date DESC',
        [loanId]
      )
      return NextResponse.json({ loan: loanResult.rows[0], payments: payments.rows })
    }

    const result = await query(
      'SELECT * FROM loans WHERE user_id = ? ORDER BY status, created_at DESC',
      [user.userId]
    )
    return NextResponse.json({ loans: result.rows })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req)

    if (!canUseLoan(user.plan)) {
      return NextResponse.json({ error: 'Loan tracking requires Pro plan. Upgrade now.' }, { status: 403 })
    }

    const body = await req.json()
    const { name, lender, principal, interest_rate, start_date, end_date, monthly_payment, notes } = body

    const id = crypto.randomUUID()
    await query(
      `INSERT INTO loans (id, user_id, name, lender, principal, interest_rate, start_date, end_date, balance, monthly_payment, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, user.userId, name, lender || null, principal, interest_rate, start_date, end_date || null, principal, monthly_payment || null, notes || null]
    )

    return NextResponse.json({ id, message: 'Loan added' }, { status: 201 })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = requireAuth(req)
    const body = await req.json()

    if (body.payment) {
      // Record a loan payment
      const { loan_id, date, amount, principal_component, interest_component, notes } = body.payment
      const loan = await query('SELECT * FROM loans WHERE id = ? AND user_id = ?', [loan_id, user.userId])
      if (loan.rowCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

      const loanData = loan.rows[0] as any
      const newBalance = Math.max(0, parseFloat(loanData.balance) - parseFloat(principal_component || 0))
      const paymentId = crypto.randomUUID()

      await query(
        `INSERT INTO loan_payments (id, loan_id, date, amount, principal_component, interest_component, balance_after, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [paymentId, loan_id, date, amount, principal_component || 0, interest_component || 0, newBalance, notes || null]
      )

      await query(
        `UPDATE loans SET balance = ?, status = ?, updated_at = NOW() WHERE id = ?`,
        [newBalance, newBalance <= 0 ? 'paid' : 'active', loan_id]
      )

      return NextResponse.json({ message: 'Payment recorded', newBalance })
    }

    // Update loan details
    const { id, name, lender, interest_rate, end_date, monthly_payment, status, notes } = body
    await query(
      `UPDATE loans SET name = ?, lender = ?, interest_rate = ?, end_date = ?, monthly_payment = ?, status = ?, notes = ?, updated_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [name, lender || null, interest_rate, end_date || null, monthly_payment || null, status, notes || null, id, user.userId]
    )

    return NextResponse.json({ message: 'Loan updated' })
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
    await query('DELETE FROM loans WHERE id = ? AND user_id = ?', [id, user.userId])
    return NextResponse.json({ message: 'Loan deleted' })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
