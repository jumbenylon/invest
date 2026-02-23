-- UTT (Unit Trust of Tanzania) Fund Products
-- Last updated: February 2026

INSERT INTO utt_funds (symbol, name, fund_type, nav, change_pct, min_investment, risk_level, description) VALUES
('UMOJA', 'Umoja Fund', 'Balanced Fund', 658.45, 0.12, 1000.00, 'medium',
 'A balanced fund investing in equities and fixed income. Suitable for investors seeking moderate growth with income.'),

('WEKEZA', 'Wekeza Maisha Fund', 'Equity Fund', 1245.80, 0.25, 1000.00, 'high',
 'An equity-focused fund targeting long-term capital growth through DSE-listed companies.'),

('JIKIMU', 'Jikimu Fund', 'Fixed Income Fund', 1089.20, 0.08, 1000.00, 'low',
 'A fixed income fund investing in government bonds and Treasury bills for steady returns with low risk.'),

('BOND', 'Bond Fund', 'Bond Fund', 1156.30, 0.06, 5000.00, 'low',
 'Invests primarily in long-term government and corporate bonds for capital preservation and income.'),

('WATOTO', 'Watoto Fund', 'Education Fund', 876.15, 0.15, 500.00, 'medium',
 'Designed for parents saving for children\'s education. Balanced growth targeting 5-15 year horizons.'),

('LIQUID', 'Liquid Fund', 'Money Market Fund', 1004.75, 0.04, 1000.00, 'low',
 'A money market fund for short-term savings. High liquidity with better returns than savings accounts.'),

('UKWASI', 'Ukwasi Fund', 'Equity Fund', 2340.60, 0.31, 10000.00, 'high',
 'An aggressive equity fund targeting high capital appreciation through strategic DSE investments.'),

('PATO', 'Pato Fund', 'Income Fund', 1312.90, 0.09, 1000.00, 'low',
 'A dividend-focused fund investing in high-dividend paying equities and bonds for regular income.')

ON DUPLICATE KEY UPDATE
  nav = VALUES(nav),
  change_pct = VALUES(change_pct),
  updated_at = CURRENT_TIMESTAMP;
