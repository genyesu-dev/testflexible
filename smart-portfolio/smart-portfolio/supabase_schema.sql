
-- Supabase SQL Editor에서 이 쿼리를 실행하세요

CREATE TABLE IF NOT EXISTS stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  market VARCHAR(10) NOT NULL CHECK (market IN ('KR', 'US')),
  avg_price DECIMAL(15,2) NOT NULL,
  quantity INTEGER NOT NULL,
  buy_date DATE,
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  market VARCHAR(10) NOT NULL CHECK (market IN ('KR', 'US')),
  target_price DECIMAL(15,2),
  category VARCHAR(20) DEFAULT 'buy_interest' CHECK (category IN ('buy_interest', 'monitoring')),
  memo TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sell_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_id UUID REFERENCES stocks(id) ON DELETE SET NULL,
  symbol VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  sell_price DECIMAL(15,2) NOT NULL,
  quantity INTEGER NOT NULL,
  profit DECIMAL(15,2),
  profit_rate DECIMAL(5,2),
  sell_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS buy_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_id UUID REFERENCES stocks(id) ON DELETE SET NULL,
  symbol VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  buy_price DECIMAL(15,2) NOT NULL,
  quantity INTEGER NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('new_buy', 'averaging_down')),
  buy_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  daily_sell_target DECIMAL(15,2) DEFAULT 200000,
  min_sell_profit_rate DECIMAL(5,2) DEFAULT 5.0,
  stop_loss_rate DECIMAL(5,2) DEFAULT -15.0,
  sell_w_peak DECIMAL(5,2) DEFAULT 40,
  sell_w_profit DECIMAL(5,2) DEFAULT 30,
  sell_w_rsi DECIMAL(5,2) DEFAULT 20,
  sell_w_trend DECIMAL(5,2) DEFAULT 10,
  avg_w_mcap_trend DECIMAL(5,2) DEFAULT 30,
  avg_w_mcap_stability DECIMAL(5,2) DEFAULT 20,
  avg_w_sector DECIMAL(5,2) DEFAULT 20,
  avg_w_flow DECIMAL(5,2) DEFAULT 15,
  avg_w_technical DECIMAL(5,2) DEFAULT 15,
  buy_w_target_gap DECIMAL(5,2) DEFAULT 25,
  buy_w_mcap_trend DECIMAL(5,2) DEFAULT 20,
  buy_w_mcap_stability DECIMAL(5,2) DEFAULT 15,
  buy_w_rsi DECIMAL(5,2) DEFAULT 15,
  buy_w_sector DECIMAL(5,2) DEFAULT 15,
  buy_w_flow DECIMAL(5,2) DEFAULT 10,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
