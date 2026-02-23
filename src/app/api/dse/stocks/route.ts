import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    requireAuth(req)

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('q')
    const sector = searchParams.get('sector')

    let sql = 'SELECT * FROM dse_stocks'
    const params: any[] = []

    const conditions: string[] = []
    if (search) {
      conditions.push('(symbol LIKE ? OR name LIKE ?)')
      params.push(`%${search}%`, `%${search}%`)
    }
    if (sector) {
      conditions.push('sector = ?')
      params.push(sector)
    }

    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ')
    sql += ' ORDER BY symbol'

    const result = await query(sql, params)

    // Get unique sectors
    const sectors = await query('SELECT DISTINCT sector FROM dse_stocks WHERE sector IS NOT NULL ORDER BY sector')

    return NextResponse.json({ stocks: result.rows, sectors: (sectors.rows as any[]).map(r => r.sector) })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
