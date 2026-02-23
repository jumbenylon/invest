import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyPassword, signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const result = await query(
      'SELECT * FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    )

    const user = result.rows[0] as any
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const valid = await verifyPassword(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    await query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id])

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      role: user.role,
    })

    const response = NextResponse.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan, role: user.role },
    })

    response.cookies.set('invest_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return response
  } catch (err: any) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
