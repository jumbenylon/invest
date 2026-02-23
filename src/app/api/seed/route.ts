import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const key = new URL(req.url).searchParams.get('key')
  if (key !== 'invest_seed_2026') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const results: string[] = []

    // ── Schema tables ──────────────────────────────────────────────
    await query(`CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role ENUM('user','admin') DEFAULT 'user',
      plan ENUM('free','pro','enterprise') DEFAULT 'free',
      subscription_expires_at DATETIME NULL,
      avatar_url VARCHAR(500) NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      last_login DATETIME NULL
    )`)
    results.push('users table ready')

    await query(`CREATE TABLE IF NOT EXISTS portfolios (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      name VARCHAR(255) NOT NULL DEFAULT 'Main Portfolio',
      currency VARCHAR(10) DEFAULT 'TZS',
      is_default TINYINT(1) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`)
    results.push('portfolios table ready')

    await query(`CREATE TABLE IF NOT EXISTS investments (
      id VARCHAR(36) PRIMARY KEY,
      portfolio_id VARCHAR(36) NOT NULL,
      user_id VARCHAR(36) NOT NULL,
      category ENUM('DSE','UTT','VEHICLE','LAND','CASH','BOND','OTHER') NOT NULL,
      symbol VARCHAR(20) NULL,
      name VARCHAR(255) NOT NULL,
      quantity DECIMAL(18,6) DEFAULT 0,
      buy_price DECIMAL(18,4) DEFAULT 0,
      current_price DECIMAL(18,4) DEFAULT 0,
      buy_date DATE NULL,
      notes TEXT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`)
    results.push('investments table ready')

    await query(`CREATE TABLE IF NOT EXISTS transactions (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      portfolio_id VARCHAR(36) NULL,
      date DATE NOT NULL,
      description VARCHAR(500) NOT NULL,
      amount DECIMAL(18,4) NOT NULL,
      category VARCHAR(100) NOT NULL,
      type ENUM('income','expense','investment','repayment','transfer') NOT NULL,
      reference VARCHAR(255) NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`)
    results.push('transactions table ready')

    await query(`CREATE TABLE IF NOT EXISTS loans (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      name VARCHAR(255) NOT NULL,
      lender VARCHAR(255) NULL,
      principal DECIMAL(18,4) NOT NULL,
      interest_rate DECIMAL(8,4) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NULL,
      balance DECIMAL(18,4) NOT NULL,
      monthly_payment DECIMAL(18,4) NULL,
      status ENUM('active','paid','defaulted') DEFAULT 'active',
      notes TEXT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`)
    results.push('loans table ready')

    await query(`CREATE TABLE IF NOT EXISTS loan_payments (
      id VARCHAR(36) PRIMARY KEY,
      loan_id VARCHAR(36) NOT NULL,
      date DATE NOT NULL,
      amount DECIMAL(18,4) NOT NULL,
      principal_component DECIMAL(18,4) DEFAULT 0,
      interest_component DECIMAL(18,4) DEFAULT 0,
      balance_after DECIMAL(18,4) NOT NULL,
      notes VARCHAR(500) NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`)
    results.push('loan_payments table ready')

    await query(`CREATE TABLE IF NOT EXISTS goals (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      name VARCHAR(255) NOT NULL,
      target_amount DECIMAL(18,4) NOT NULL,
      current_amount DECIMAL(18,4) DEFAULT 0,
      target_date DATE NULL,
      category VARCHAR(100) DEFAULT 'General',
      icon VARCHAR(50) NULL,
      color VARCHAR(20) DEFAULT '#ff1a66',
      status ENUM('active','completed','paused') DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`)
    results.push('goals table ready')

    await query(`CREATE TABLE IF NOT EXISTS dse_stocks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      symbol VARCHAR(20) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      sector VARCHAR(100) NULL,
      last_price DECIMAL(18,4) DEFAULT 0,
      change_pct DECIMAL(8,4) DEFAULT 0,
      change_amount DECIMAL(18,4) DEFAULT 0,
      volume BIGINT DEFAULT 0,
      market_cap DECIMAL(22,4) NULL,
      pe_ratio DECIMAL(10,4) NULL,
      dividend_yield DECIMAL(8,4) NULL,
      week_52_high DECIMAL(18,4) NULL,
      week_52_low DECIMAL(18,4) NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`)
    results.push('dse_stocks table ready')

    await query(`CREATE TABLE IF NOT EXISTS utt_funds (
      id INT AUTO_INCREMENT PRIMARY KEY,
      symbol VARCHAR(20) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      fund_type VARCHAR(100) NULL,
      nav DECIMAL(18,6) DEFAULT 0,
      change_pct DECIMAL(8,4) DEFAULT 0,
      min_investment DECIMAL(18,4) DEFAULT 1000,
      total_assets DECIMAL(22,4) NULL,
      risk_level ENUM('low','medium','high') DEFAULT 'medium',
      description TEXT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`)
    results.push('utt_funds table ready')

    await query(`CREATE TABLE IF NOT EXISTS watchlist (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      symbol VARCHAR(20) NOT NULL,
      type ENUM('DSE','UTT') NOT NULL,
      alert_price DECIMAL(18,4) NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_watch (user_id, symbol, type)
    )`)
    results.push('watchlist table ready')

    // ── DSE Stocks ─────────────────────────────────────────────────
    const dseStocks = [
      ['CRDB','CRDB Bank Plc','Banking',480.00,1.05,5.00,1152000000000.00,520.00,380.00],
      ['NMB','NMB Bank Plc','Banking',4600.00,-0.43,-20.00,2714000000000.00,5200.00,4000.00],
      ['DCB','DCB Commercial Bank','Banking',310.00,0.00,0.00,46500000000.00,350.00,270.00],
      ['MKCB','Mkombozi Commercial Bank','Banking',600.00,0.00,0.00,18000000000.00,700.00,500.00],
      ['MUCOBA','Mufindi Community Bank','Banking',620.00,0.00,0.00,12400000000.00,700.00,540.00],
      ['KCB','KCB Bank Tanzania','Banking',1200.00,0.00,0.00,60000000000.00,1400.00,1000.00],
      ['NBC','National Bank of Commerce','Banking',540.00,0.00,0.00,270000000000.00,600.00,460.00],
      ['VODA','Vodacom Tanzania Plc','Telecoms',840.00,-0.59,-5.00,1680000000000.00,920.00,720.00],
      ['TTCL','Tanzania Telecommunications','Telecoms',420.00,0.00,0.00,84000000000.00,500.00,360.00],
      ['TBL','Tanzania Breweries Ltd','Manufacturing',5200.00,0.00,0.00,1040000000000.00,5800.00,4400.00],
      ['TPCC','Tanzania Portland Cement','Manufacturing',1400.00,1.45,20.00,336000000000.00,1600.00,1100.00],
      ['TOL','TOL Gases Ltd','Manufacturing',580.00,0.00,0.00,116000000000.00,660.00,480.00],
      ['TCC','Tanzania Cigarette Company','Manufacturing',12500.00,0.00,0.00,937500000000.00,14000.00,11000.00],
      ['SWALA','Swala Energy Ltd','Energy',25.00,0.00,0.00,3750000000.00,35.00,18.00],
      ['EABL','East African Breweries','Consumer Goods',2800.00,0.00,0.00,420000000000.00,3200.00,2400.00],
      ['TATEPA','Tanzania Tea Packers','Agriculture',360.00,0.00,0.00,10800000000.00,420.00,300.00],
      ['MEIL','Mohammed Enterprises (T)','Conglomerate',7000.00,0.00,0.00,175000000000.00,8000.00,5800.00],
      ['NICO','NICO Holdings','Insurance',380.00,0.00,0.00,22800000000.00,440.00,320.00],
      ['NICOL','NICO Life Insurance','Insurance',300.00,0.00,0.00,6000000000.00,350.00,250.00],
      ['JUBILEE','Jubilee Holdings','Insurance',2200.00,0.00,0.00,110000000000.00,2600.00,1800.00],
      ['PAL','Pan African Energy','Energy',4500.00,2.27,100.00,900000000000.00,5000.00,3800.00],
      ['WATUMISHI','Watumishi Housing','Real Estate',560.00,0.00,0.00,33600000000.00,640.00,460.00],
      ['MBP','Maendeleo Bank Plc','Banking',820.00,0.61,5.00,41000000000.00,920.00,700.00],
      ['TWIGA','Twiga Cement','Manufacturing',1600.00,0.00,0.00,192000000000.00,1800.00,1300.00],
      ['DSE','Dar es Salaam Stock Exchange','Financial Services',3200.00,0.00,0.00,64000000000.00,3600.00,2600.00],
      ['JATU','Jatu Plc','Manufacturing',2400.00,0.00,0.00,48000000000.00,2800.00,1900.00],
    ]

    for (const [sym, name, sector, price, chg, chgAmt, mktCap, high, low] of dseStocks) {
      await query(
        `INSERT INTO dse_stocks (symbol, name, sector, last_price, change_pct, change_amount, market_cap, week_52_high, week_52_low)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE last_price=VALUES(last_price), change_pct=VALUES(change_pct), updated_at=NOW()`,
        [sym, name, sector, price, chg, chgAmt, mktCap, high, low]
      )
    }
    results.push(`${dseStocks.length} DSE stocks seeded`)

    // ── UTT Funds ──────────────────────────────────────────────────
    const uttFunds = [
      ['UMOJA','Umoja Fund','Balanced Fund',658.45,0.12,1000,'medium','A balanced fund investing in equities and fixed income.'],
      ['WEKEZA','Wekeza Maisha Fund','Equity Fund',1245.80,0.25,1000,'high','An equity-focused fund targeting long-term capital growth.'],
      ['JIKIMU','Jikimu Fund','Fixed Income Fund',1089.20,0.08,1000,'low','A fixed income fund investing in government bonds and T-bills.'],
      ['BOND','Bond Fund','Bond Fund',1156.30,0.06,5000,'low','Invests in long-term government and corporate bonds.'],
      ['WATOTO','Watoto Fund','Education Fund',876.15,0.15,500,'medium','Designed for parents saving for children\'s education.'],
      ['LIQUID','Liquid Fund','Money Market Fund',1004.75,0.04,1000,'low','Money market fund with high liquidity and better returns than savings.'],
      ['UKWASI','Ukwasi Fund','Equity Fund',2340.60,0.31,10000,'high','Aggressive equity fund targeting high capital appreciation.'],
      ['PATO','Pato Fund','Income Fund',1312.90,0.09,1000,'low','Dividend-focused fund for regular income.'],
    ]

    for (const [sym, name, type, nav, chg, minInv, risk, desc] of uttFunds) {
      await query(
        `INSERT INTO utt_funds (symbol, name, fund_type, nav, change_pct, min_investment, risk_level, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE nav=VALUES(nav), change_pct=VALUES(change_pct), updated_at=NOW()`,
        [sym, name, type, nav, chg, minInv, risk, desc]
      )
    }
    results.push(`${uttFunds.length} UTT funds seeded`)

    // ── jumbenylon user ────────────────────────────────────────────
    const existing = await query('SELECT id FROM users WHERE email = ?', ['jumbenylon@gmail.com'])
    let userId: string

    if (existing.rowCount === 0) {
      userId = crypto.randomUUID()
      const passwordHash = await hashPassword('@Hkgg8886')
      await query(
        `INSERT INTO users (id, email, password_hash, name, plan) VALUES (?, ?, ?, ?, ?)`,
        [userId, 'jumbenylon@gmail.com', passwordHash, 'Jumbe Nylon', 'pro']
      )

      const portfolioId = crypto.randomUUID()
      await query(
        `INSERT INTO portfolios (id, user_id, name, currency, is_default) VALUES (?, ?, ?, ?, ?)`,
        [portfolioId, userId, 'Main Portfolio', 'TZS', 1]
      )
      results.push('jumbenylon user + portfolio created')
    } else {
      userId = (existing.rows[0] as any).id
      results.push('jumbenylon user already exists')
    }

    return NextResponse.json({ success: true, results })
  } catch (err: any) {
    console.error('Seed error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
