import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'invest_sakura_default_secret'

export interface JWTPayload {
  userId: string
  email: string
  name: string
  plan: 'free' | 'pro' | 'enterprise'
  role: string
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' })
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function getAuthFromRequest(req: NextRequest): JWTPayload | null {
  try {
    const auth = req.headers.get('authorization')
    if (auth?.startsWith('Bearer ')) {
      return verifyToken(auth.substring(7))
    }
    // Also check cookie
    const cookie = req.cookies.get('invest_token')?.value
    if (cookie) {
      return verifyToken(cookie)
    }
    return null
  } catch {
    return null
  }
}

export function requireAuth(req: NextRequest): JWTPayload {
  const auth = getAuthFromRequest(req)
  if (!auth) throw new Error('Unauthorized')
  return auth
}
