-- DSE (Dar es Salaam Stock Exchange) Listed Companies
-- Last updated: February 2026

INSERT INTO dse_stocks (symbol, name, sector, last_price, change_pct, change_amount, market_cap, week_52_high, week_52_low) VALUES
-- Banking & Financial Services
('CRDB', 'CRDB Bank Plc', 'Banking', 480.00, 1.05, 5.00, 1152000000000.00, 520.00, 380.00),
('NMB', 'NMB Bank Plc', 'Banking', 4600.00, -0.43, -20.00, 2714000000000.00, 5200.00, 4000.00),
('DCB', 'DCB Commercial Bank', 'Banking', 310.00, 0.00, 0.00, 46500000000.00, 350.00, 270.00),
('MKCB', 'Mkombozi Commercial Bank', 'Banking', 600.00, 0.00, 0.00, 18000000000.00, 700.00, 500.00),
('MUCOBA', 'Mufindi Community Bank', 'Banking', 620.00, 0.00, 0.00, 12400000000.00, 700.00, 540.00),
('KCB', 'KCB Bank Tanzania', 'Banking', 1200.00, 0.00, 0.00, 60000000000.00, 1400.00, 1000.00),
('NBC', 'National Bank of Commerce', 'Banking', 540.00, 0.00, 0.00, 270000000000.00, 600.00, 460.00),
('UCHUMI', 'Uchumi Commercial Bank', 'Banking', 450.00, 0.00, 0.00, 13500000000.00, 500.00, 380.00),

-- Telecommunications
('VODA', 'Vodacom Tanzania Plc', 'Telecoms', 840.00, -0.59, -5.00, 1680000000000.00, 920.00, 720.00),
('TTCL', 'Tanzania Telecommunications', 'Telecoms', 420.00, 0.00, 0.00, 84000000000.00, 500.00, 360.00),

-- Manufacturing & Industry
('TBL', 'Tanzania Breweries Ltd', 'Manufacturing', 5200.00, 0.00, 0.00, 1040000000000.00, 5800.00, 4400.00),
('TPCC', 'Tanzania Portland Cement', 'Manufacturing', 1400.00, 1.45, 20.00, 336000000000.00, 1600.00, 1100.00),
('TOL', 'TOL Gases Ltd', 'Manufacturing', 580.00, 0.00, 0.00, 116000000000.00, 660.00, 480.00),
('TCC', 'Tanzania Cigarette Company', 'Manufacturing', 12500.00, 0.00, 0.00, 937500000000.00, 14000.00, 11000.00),
('SWALA', 'Swala Energy Ltd', 'Energy', 25.00, 0.00, 0.00, 3750000000.00, 35.00, 18.00),

-- Agriculture & Food
('EABL', 'East African Breweries', 'Consumer Goods', 2800.00, 0.00, 0.00, 420000000000.00, 3200.00, 2400.00),
('TATEPA', 'Tanzania Tea Packers', 'Agriculture', 360.00, 0.00, 0.00, 10800000000.00, 420.00, 300.00),
('MEIL', 'Mohammed Enterprises (T)', 'Conglomerate', 7000.00, 0.00, 0.00, 175000000000.00, 8000.00, 5800.00),
('USL', 'Urafiki Textile Mill', 'Manufacturing', 430.00, 0.00, 0.00, 8600000000.00, 500.00, 360.00),

-- Insurance & Financial
('NICO', 'NICO Holdings', 'Insurance', 380.00, 0.00, 0.00, 22800000000.00, 440.00, 320.00),
('NICOL', 'NICO Life Insurance', 'Insurance', 300.00, 0.00, 0.00, 6000000000.00, 350.00, 250.00),
('JUBILEE', 'Jubilee Holdings', 'Insurance', 2200.00, 0.00, 0.00, 110000000000.00, 2600.00, 1800.00),
('PAL', 'Pan African Energy', 'Energy', 4500.00, 2.27, 100.00, 900000000000.00, 5000.00, 3800.00),

-- Real Estate & Property
('WATUMISHI', 'Watumishi Housing', 'Real Estate', 560.00, 0.00, 0.00, 33600000000.00, 640.00, 460.00),
('TANESCO', 'Tanzania Electric Supply', 'Utilities', 220.00, 0.00, 0.00, 44000000000.00, 260.00, 180.00),

-- Cross-Listed
('MBP', 'Maendeleo Bank Plc', 'Banking', 820.00, 0.61, 5.00, 41000000000.00, 920.00, 700.00),
('TWIGA', 'Twiga Cement', 'Manufacturing', 1600.00, 0.00, 0.00, 192000000000.00, 1800.00, 1300.00),
('DSE', 'Dar es Salaam Stock Exchange', 'Financial Services', 3200.00, 0.00, 0.00, 64000000000.00, 3600.00, 2600.00),
('JATU', 'Jatu Plc', 'Manufacturing', 2400.00, 0.00, 0.00, 48000000000.00, 2800.00, 1900.00)

ON DUPLICATE KEY UPDATE
  last_price = VALUES(last_price),
  change_pct = VALUES(change_pct),
  change_amount = VALUES(change_amount),
  market_cap = VALUES(market_cap),
  updated_at = CURRENT_TIMESTAMP;
