import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { hashPassword, signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const existing = await query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()])
    if (existing.rowCount > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const userId = crypto.randomUUID()

    await query(
      'INSERT INTO users (id, email, password_hash, name, plan) VALUES (?, ?, ?, ?, ?)',
      [userId, email.toLowerCase().trim(), passwordHash, name.trim(), 'free']
    )

    // Create default portfolio
    const portfolioId = crypto.randomUUID()
    await query(
      'INSERT INTO portfolios (id, user_id, name, currency, is_default) VALUES (?, ?, ?, ?, ?)',
      [portfolioId, userId, 'Main Portfolio', 'TZS', 1]
    )

    const token = signToken({
      userId,
      email: email.toLowerCase().trim(),
      name: name.trim(),
      plan: 'free',
      role: 'user',
    })

    return NextResponse.json({
      token,
      user: { id: userId, email: email.toLowerCase().trim(), name: name.trim(), plan: 'free' },
    })
  } catch (err: any) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
