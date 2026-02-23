import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: process.env.DB_SSL === 'true' ? {} : undefined,
})

export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<{ rows: T[]; rowCount: number }> {
  const [result] = await pool.execute(sql, params ?? [])
  if (Array.isArray(result)) {
    return { rows: result as T[], rowCount: result.length }
  }
  return { rows: [] as T[], rowCount: (result as any).affectedRows ?? 0 }
}

export async function transaction<T>(
  fn: (client: {
    query: <R = any>(sql: string, params?: any[]) => Promise<{ rows: R[]; rowCount: number }>
  }) => Promise<T>
): Promise<T> {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const client = {
      query: async <R = any>(sql: string, params?: any[]): Promise<{ rows: R[]; rowCount: number }> => {
        const [result] = await conn.execute(sql, params ?? [])
        if (Array.isArray(result)) {
          return { rows: result as R[], rowCount: result.length }
        }
        return { rows: [] as R[], rowCount: (result as any).affectedRows ?? 0 }
      },
    }
    const result = await fn(client)
    await conn.commit()
    return result
  } catch (e) {
    await conn.rollback()
    throw e
  } finally {
    conn.release()
  }
}

export default pool
