/**
 * Migrate data from Neon PostgreSQL (old mimi app) → MySQL sakuragr_invest
 *
 * Usage:
 *   cd /Users/jumbenylon/Documents/GitHub/invest
 *   npx ts-node -r tsconfig-paths/register scripts/migrate-neon.ts
 *
 * Requires .env with:
 *   NEON_DATABASE_URL=...
 *   DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
 */

import 'dotenv/config'
import { Client as PgClient } from 'pg'
import mysql from 'mysql2/promise'
import crypto from 'crypto'

const JUMBE_EMAIL = 'jumbenylon@gmail.com'

async function main() {
  console.log('=== Mimi Invest: Neon → MySQL Migration ===\n')

  if (!process.env.NEON_DATABASE_URL) {
    throw new Error('NEON_DATABASE_URL not set in .env')
  }

  // ── Connect ──────────────────────────────────────────────────────
  const pg = new PgClient({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } })
  await pg.connect()
  console.log('✓ Connected to Neon PostgreSQL')

  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  })
  console.log('✓ Connected to MySQL\n')

  // ── Get jumbenylon user in MySQL ──────────────────────────────────
  const [userRows] = await pool.execute<any[]>('SELECT id FROM users WHERE email = ?', [JUMBE_EMAIL])
  if (userRows.length === 0) {
    console.error(`✗ User ${JUMBE_EMAIL} not found in MySQL. Run /api/seed first.`)
    process.exit(1)
  }
  const userId = userRows[0].id
  console.log(`✓ Found MySQL user: ${userId}`)

  // Get default portfolio
  const [portRows] = await pool.execute<any[]>('SELECT id FROM portfolios WHERE user_id = ? AND is_default = 1', [userId])
  let portfolioId: string
  if (portRows.length === 0) {
    portfolioId = crypto.randomUUID()
    await pool.execute('INSERT INTO portfolios (id, user_id, name, currency, is_default) VALUES (?, ?, ?, ?, ?)',
      [portfolioId, userId, 'Main Portfolio', 'TZS', 1])
    console.log('✓ Created default portfolio')
  } else {
    portfolioId = portRows[0].id
    console.log(`✓ Using portfolio: ${portfolioId}`)
  }

  // ── Inspect Neon tables ───────────────────────────────────────────
  const tables = await pg.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`)
  console.log('\nNeon tables:', tables.rows.map((r: any) => r.table_name).join(', '))

  // ── Migrate Transactions ──────────────────────────────────────────
  let txMigrated = 0
  try {
    const txResult = await pg.query('SELECT * FROM transactions ORDER BY date')
    console.log(`\nFound ${txResult.rows.length} transactions in Neon`)

    for (const tx of txResult.rows) {
      const id = crypto.randomUUID()
      const type = tx.type || (parseFloat(tx.amount) > 0 ? 'income' : 'expense')
      const amount = Math.abs(parseFloat(tx.amount))
      const category = tx.category || tx.type || 'General'
      const date = tx.date ? new Date(tx.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      const description = tx.description || tx.note || tx.memo || 'Transaction'

      try {
        await pool.execute(
          'INSERT INTO transactions (id, user_id, portfolio_id, date, description, amount, category, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [id, userId, portfolioId, date, description, amount, category, type]
        )
        txMigrated++
      } catch (e: any) {
        console.warn(`  Skip tx: ${e.message}`)
      }
    }
    console.log(`✓ Migrated ${txMigrated} transactions`)
  } catch (e: any) {
    console.log(`  No transactions table or error: ${e.message}`)
  }

  // ── Migrate Investments / Assets ──────────────────────────────────
  let invMigrated = 0
  try {
    // Try common table names from old mimi app
    const tableNames = ['investments', 'assets', 'portfolio']
    for (const tbl of tableNames) {
      try {
        const invResult = await pg.query(`SELECT * FROM ${tbl}`)
        if (invResult.rows.length === 0) continue
        console.log(`\nFound ${invResult.rows.length} records in ${tbl}`)

        for (const inv of invResult.rows) {
          const id = crypto.randomUUID()
          const category = inv.category || inv.asset_type || inv.type || 'OTHER'
          const mappedCat = ['DSE', 'UTT', 'VEHICLE', 'LAND', 'CASH', 'BOND'].includes(category.toUpperCase()) ? category.toUpperCase() : 'OTHER'
          const name = inv.name || inv.asset_name || inv.symbol || 'Investment'
          const symbol = inv.symbol || inv.ticker || null
          const quantity = parseFloat(inv.quantity || inv.units || inv.shares || '1')
          const buyPrice = parseFloat(inv.buy_price || inv.purchase_price || inv.cost || inv.value || '0')
          const currentPrice = parseFloat(inv.current_price || inv.market_price || inv.price || buyPrice.toString())
          const buyDate = inv.buy_date || inv.purchase_date || inv.date

          try {
            await pool.execute(
              'INSERT INTO investments (id, portfolio_id, user_id, category, symbol, name, quantity, buy_price, current_price, buy_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [id, portfolioId, userId, mappedCat, symbol, name, quantity, buyPrice, currentPrice, buyDate ? new Date(buyDate).toISOString().split('T')[0] : null]
            )
            invMigrated++
          } catch (e: any) {
            console.warn(`  Skip inv: ${e.message}`)
          }
        }
        console.log(`✓ Migrated ${invMigrated} investments from ${tbl}`)
        break
      } catch {
        // Table doesn't exist, try next
      }
    }
  } catch (e: any) {
    console.log(`  Investment migration: ${e.message}`)
  }

  // ── Migrate Loans ─────────────────────────────────────────────────
  let loansMigrated = 0
  try {
    const loanResult = await pg.query('SELECT * FROM loans')
    console.log(`\nFound ${loanResult.rows.length} loans in Neon`)

    for (const loan of loanResult.rows) {
      const id = crypto.randomUUID()
      const principal = parseFloat(loan.principal || loan.amount || loan.original_amount || '0')
      const balance = parseFloat(loan.balance || loan.remaining || principal.toString())
      const rate = parseFloat(loan.interest_rate || loan.rate || '0')
      const startDate = loan.start_date || loan.date || new Date().toISOString().split('T')[0]

      try {
        await pool.execute(
          'INSERT INTO loans (id, user_id, name, lender, principal, interest_rate, start_date, balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [id, userId, loan.name || loan.description || 'Loan', loan.lender || loan.source || null, principal, rate, new Date(startDate).toISOString().split('T')[0], balance]
        )
        loansMigrated++
      } catch (e: any) {
        console.warn(`  Skip loan: ${e.message}`)
      }
    }
    console.log(`✓ Migrated ${loansMigrated} loans`)
  } catch (e: any) {
    console.log(`  No loans table: ${e.message}`)
  }

  // ── Migrate Loan Schedule / Payments ──────────────────────────────
  try {
    const schedResult = await pg.query('SELECT * FROM loan_schedule ORDER BY date')
    console.log(`\nFound ${schedResult.rows.length} loan schedule entries in Neon`)

    // We can't easily map old loan_ids, skip for now
    console.log('  Note: Loan schedule migration requires manual mapping of loan IDs')
  } catch {
    // Table may not exist
  }

  // ── Done ──────────────────────────────────────────────────────────
  await pg.end()
  await pool.end()

  console.log('\n=== Migration Complete ===')
  console.log(`Transactions: ${txMigrated}`)
  console.log(`Investments:  ${invMigrated}`)
  console.log(`Loans:        ${loansMigrated}`)
  console.log('\nRun next: open https://invest.sakuragroup.co.tz/dashboard')
}

main().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
