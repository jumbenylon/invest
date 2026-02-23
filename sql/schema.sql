-- Investment Super App Schema
-- Database: sakuragr_invest

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  plan ENUM('free', 'pro', 'enterprise') DEFAULT 'free',
  subscription_expires_at DATETIME NULL,
  avatar_url VARCHAR(500) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login DATETIME NULL
);

CREATE TABLE IF NOT EXISTS portfolios (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL DEFAULT 'Main Portfolio',
  currency VARCHAR(10) DEFAULT 'TZS',
  is_default TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS investments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  portfolio_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  category ENUM('DSE', 'UTT', 'VEHICLE', 'LAND', 'CASH', 'BOND', 'OTHER') NOT NULL,
  symbol VARCHAR(20) NULL,
  name VARCHAR(255) NOT NULL,
  quantity DECIMAL(18, 6) DEFAULT 0,
  buy_price DECIMAL(18, 4) DEFAULT 0,
  current_price DECIMAL(18, 4) DEFAULT 0,
  buy_date DATE NULL,
  notes TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  portfolio_id VARCHAR(36) NULL,
  date DATE NOT NULL,
  description VARCHAR(500) NOT NULL,
  amount DECIMAL(18, 4) NOT NULL,
  category VARCHAR(100) NOT NULL,
  type ENUM('income', 'expense', 'investment', 'repayment', 'transfer') NOT NULL,
  reference VARCHAR(255) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS loans (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  lender VARCHAR(255) NULL,
  principal DECIMAL(18, 4) NOT NULL,
  interest_rate DECIMAL(8, 4) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NULL,
  balance DECIMAL(18, 4) NOT NULL,
  monthly_payment DECIMAL(18, 4) NULL,
  status ENUM('active', 'paid', 'defaulted') DEFAULT 'active',
  notes TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS loan_payments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  loan_id VARCHAR(36) NOT NULL,
  date DATE NOT NULL,
  amount DECIMAL(18, 4) NOT NULL,
  principal_component DECIMAL(18, 4) DEFAULT 0,
  interest_component DECIMAL(18, 4) DEFAULT 0,
  balance_after DECIMAL(18, 4) NOT NULL,
  notes VARCHAR(500) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS goals (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  target_amount DECIMAL(18, 4) NOT NULL,
  current_amount DECIMAL(18, 4) DEFAULT 0,
  target_date DATE NULL,
  category VARCHAR(100) DEFAULT 'General',
  icon VARCHAR(50) NULL,
  color VARCHAR(20) DEFAULT '#ff1a66',
  status ENUM('active', 'completed', 'paused') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS dse_stocks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  sector VARCHAR(100) NULL,
  last_price DECIMAL(18, 4) DEFAULT 0,
  change_pct DECIMAL(8, 4) DEFAULT 0,
  change_amount DECIMAL(18, 4) DEFAULT 0,
  volume BIGINT DEFAULT 0,
  market_cap DECIMAL(22, 4) NULL,
  pe_ratio DECIMAL(10, 4) NULL,
  dividend_yield DECIMAL(8, 4) NULL,
  week_52_high DECIMAL(18, 4) NULL,
  week_52_low DECIMAL(18, 4) NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS utt_funds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  fund_type VARCHAR(100) NULL,
  nav DECIMAL(18, 6) DEFAULT 0,
  change_pct DECIMAL(8, 4) DEFAULT 0,
  min_investment DECIMAL(18, 4) DEFAULT 1000,
  total_assets DECIMAL(22, 4) NULL,
  risk_level ENUM('low', 'medium', 'high') DEFAULT 'medium',
  description TEXT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS watchlist (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  symbol VARCHAR(20) NOT NULL,
  type ENUM('DSE', 'UTT') NOT NULL,
  alert_price DECIMAL(18, 4) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_watch (user_id, symbol, type),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_investments_user ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_portfolio ON investments(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_loans_user ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist(user_id);
