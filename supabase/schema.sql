-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Create custom types
CREATE TYPE platform_type AS ENUM ('rideshare', 'delivery', 'freelance', 'other');
CREATE TYPE connection_type AS ENUM ('plaid', 'manual', 'email_parse', 'api');
CREATE TYPE expense_category AS ENUM ('fuel', 'maintenance', 'insurance', 'phone', 'food', 'supplies', 'other');
CREATE TYPE tax_filing_status AS ENUM ('single', 'married_filing_jointly', 'married_filing_separately', 'head_of_household');
CREATE TYPE withholding_status AS ENUM ('pending', 'processed', 'failed');

-- Users table (extends Firebase auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid VARCHAR UNIQUE NOT NULL,
  email VARCHAR NOT NULL,
  full_name VARCHAR,
  phone VARCHAR,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  tax_filing_status tax_filing_status DEFAULT 'single',
  estimated_tax_rate DECIMAL(5,4) DEFAULT 0.25,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gig platforms table
CREATE TABLE platforms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  type platform_type NOT NULL,
  api_available BOOLEAN DEFAULT FALSE,
  color VARCHAR DEFAULT '#6366f1',
  icon_url VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default platforms
INSERT INTO platforms (name, type, api_available, color, icon_url) VALUES
('Uber', 'rideshare', true, '#000000', NULL),
('Lyft', 'rideshare', true, '#ff00bf', NULL),
('DoorDash', 'delivery', true, '#ff3008', NULL),
('Uber Eats', 'delivery', true, '#000000', NULL),
('Grubhub', 'delivery', false, '#f63440', NULL),
('Instacart', 'delivery', false, '#43b02a', NULL),
('Upwork', 'freelance', true, '#6fda44', NULL),
('Fiverr', 'freelance', false, '#1dbf73', NULL),
('TaskRabbit', 'other', false, '#140078', NULL);

-- Connected accounts
CREATE TABLE connected_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES platforms(id) ON DELETE CASCADE,
  account_identifier VARCHAR NOT NULL,
  connection_type connection_type NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform_id)
);

-- Earnings table
CREATE TABLE earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES platforms(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  gross_amount DECIMAL(10,2) NOT NULL,
  fees DECIMAL(10,2) DEFAULT 0,
  tips DECIMAL(10,2) DEFAULT 0,
  date DATE NOT NULL,
  transaction_id VARCHAR,
  description TEXT,
  trip_count INTEGER DEFAULT 0,
  hours_worked DECIMAL(4,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform_id, transaction_id)
);

-- Expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  category expense_category NOT NULL,
  subcategory VARCHAR,
  description TEXT,
  receipt_url VARCHAR,
  is_business_expense BOOLEAN DEFAULT TRUE,
  mileage DECIMAL(8,2),
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tax withholdings
CREATE TABLE tax_withholdings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  percentage DECIMAL(5,4) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status withholding_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Income predictions
CREATE TABLE income_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  prediction_date DATE NOT NULL,
  predicted_amount DECIMAL(10,2) NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL,
  actual_amount DECIMAL(10,2),
  model_version VARCHAR DEFAULT 'v1.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User goals table
CREATE TABLE user_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  goal_type VARCHAR NOT NULL, -- 'daily', 'weekly', 'monthly'
  target_amount DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR NOT NULL, -- 'earnings', 'tax', 'goal', 'system'
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_earnings_user_date ON earnings(user_id, date DESC);
CREATE INDEX idx_earnings_platform ON earnings(platform_id);
CREATE INDEX idx_expenses_user_date ON expenses(user_id, date DESC);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_connected_accounts_user ON connected_accounts(user_id);
CREATE INDEX idx_tax_withholdings_user ON tax_withholdings(user_id);
CREATE INDEX idx_income_predictions_user_date ON income_predictions(user_id, prediction_date DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to users table
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_withholdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies (users can only access their own data)
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (firebase_uid = auth.uid());

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (firebase_uid = auth.uid());

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (firebase_uid = auth.uid());

CREATE POLICY "Users can view own connected accounts" ON connected_accounts
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()));

CREATE POLICY "Users can manage own connected accounts" ON connected_accounts
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()));

CREATE POLICY "Users can view own earnings" ON earnings
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()));

CREATE POLICY "Users can manage own earnings" ON earnings
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()));

CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()));

CREATE POLICY "Users can manage own expenses" ON expenses
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()));

CREATE POLICY "Users can view own tax withholdings" ON tax_withholdings
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()));

CREATE POLICY "Users can manage own tax withholdings" ON tax_withholdings
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()));

CREATE POLICY "Users can view own income predictions" ON income_predictions
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()));

CREATE POLICY "Users can manage own income predictions" ON income_predictions
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()));

CREATE POLICY "Users can view own goals" ON user_goals
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()));

CREATE POLICY "Users can manage own goals" ON user_goals
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()));

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()));

CREATE POLICY "Users can manage own notifications" ON notifications
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()));

-- Everyone can view platforms (read-only)
CREATE POLICY "Everyone can view platforms" ON platforms FOR SELECT TO authenticated USING (true);

-- Create functions for common operations
CREATE OR REPLACE FUNCTION get_user_by_firebase_uid(firebase_uid_param VARCHAR)
RETURNS TABLE(
  id UUID,
  firebase_uid VARCHAR,
  email VARCHAR,
  full_name VARCHAR,
  phone VARCHAR,
  onboarding_completed BOOLEAN,
  tax_filing_status tax_filing_status,
  estimated_tax_rate DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.firebase_uid, u.email, u.full_name, u.phone, 
         u.onboarding_completed, u.tax_filing_status, u.estimated_tax_rate,
         u.created_at, u.updated_at
  FROM users u
  WHERE u.firebase_uid = firebase_uid_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate total earnings for a user in a date range
CREATE OR REPLACE FUNCTION get_user_earnings_summary(
  user_id_param UUID,
  start_date DATE,
  end_date DATE
)
RETURNS TABLE(
  total_earnings DECIMAL,
  total_tips DECIMAL,
  total_fees DECIMAL,
  total_hours DECIMAL,
  total_trips INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(e.amount), 0) as total_earnings,
    COALESCE(SUM(e.tips), 0) as total_tips,
    COALESCE(SUM(e.fees), 0) as total_fees,
    COALESCE(SUM(e.hours_worked), 0) as total_hours,
    COALESCE(SUM(e.trip_count), 0) as total_trips
  FROM earnings e
  WHERE e.user_id = user_id_param
    AND e.date >= start_date
    AND e.date <= end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;