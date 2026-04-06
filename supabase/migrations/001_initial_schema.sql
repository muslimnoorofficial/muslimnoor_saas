-- ============================================================================
-- MosqueOS Database Schema
-- ============================================================================

-- ============================================================================
-- 1. ROLES & PERMISSIONS
-- ============================================================================
CREATE TYPE user_role AS ENUM ('super_admin', 'mosque_admin', 'member', 'donor');
CREATE TYPE donation_type AS ENUM ('one_time', 'monthly');
CREATE TYPE donation_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE subscription_status AS ENUM ('active', 'paused', 'canceled', 'expired');
CREATE TYPE prayer_calculation_method AS ENUM ('isna', 'mwl', 'karachi', 'umm_al_qura', 'egyptian', 'kuwait', 'qatar');
CREATE TYPE prayer_madhab AS ENUM ('hanafi', 'shafi', 'hanbali', 'maliki');

-- ============================================================================
-- 2. MOSQUES TABLE (Multi-tenancy core)
-- ============================================================================
CREATE TABLE IF NOT EXISTS mosques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  city VARCHAR(255) NOT NULL,
  state VARCHAR(2),
  timezone TEXT NOT NULL DEFAULT 'America/Chicago',
  
  -- Stripe Connect Account
  stripe_account_id VARCHAR(255),
  stripe_connected_at TIMESTAMP WITH TIME ZONE,
  stripe_charges_enabled BOOLEAN DEFAULT FALSE,
  stripe_payouts_enabled BOOLEAN DEFAULT FALSE,
  
  -- Mosque Settings
  ein VARCHAR(20),
  calculation_method prayer_calculation_method DEFAULT 'isna',
  madhab prayer_madhab DEFAULT 'hanafi',
  
  -- Feature Flags
  donations_enabled BOOLEAN DEFAULT TRUE,
  events_enabled BOOLEAN DEFAULT TRUE,
  announcements_enabled BOOLEAN DEFAULT TRUE,
  prayer_times_enabled BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_mosques_slug ON mosques(slug);
CREATE INDEX idx_mosques_created_at ON mosques(created_at DESC);

-- ============================================================================
-- 3. USERS TABLE (with Supabase Auth integration)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  
  -- Role & Permission
  global_role user_role DEFAULT 'member',
  
  -- Preferences
  email_notifications_enabled BOOLEAN DEFAULT TRUE,
  phone VARCHAR(20),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_global_role ON users(global_role);

-- ============================================================================
-- 4. MOSQUE MEMBERSHIP (Users → Mosques relationship)
-- ============================================================================
CREATE TABLE IF NOT EXISTS mosque_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mosque_id UUID NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
  
  -- Role at this specific mosque
  role user_role NOT NULL DEFAULT 'member',
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  invitation_token VARCHAR(255),
  invitation_accepted_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, mosque_id)
);

CREATE INDEX idx_mosque_members_user_id ON mosque_members(user_id);
CREATE INDEX idx_mosque_members_mosque_id ON mosque_members(mosque_id);
CREATE INDEX idx_mosque_members_role ON mosque_members(role);

-- ============================================================================
-- 5. DONATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mosque_id UUID NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Donation Details
  amount BIGINT NOT NULL, -- in cents
  currency VARCHAR(3) DEFAULT 'USD',
  donation_type donation_type NOT NULL,
  purpose VARCHAR(100) DEFAULT 'general',
  
  -- Donor Info (for guests)
  donor_name VARCHAR(255),
  donor_email VARCHAR(255),
  donor_phone VARCHAR(20),
  
  -- Stripe Integration
  stripe_payment_intent_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  
  -- Status
  status donation_status DEFAULT 'pending',
  
  -- Receipts
  receipt_url TEXT,
  receipt_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Tax Deductibility
  is_tax_deductible BOOLEAN DEFAULT TRUE,
  tax_receipt_number VARCHAR(50),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_donations_mosque_id ON donations(mosque_id);
CREATE INDEX idx_donations_user_id ON donations(user_id);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX idx_donations_stripe_payment_intent_id ON donations(stripe_payment_intent_id);
CREATE INDEX idx_donations_stripe_subscription_id ON donations(stripe_subscription_id);

-- ============================================================================
-- 6. SUBSCRIPTIONS TABLE (Recurring donations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mosque_id UUID NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Subscription Details
  amount BIGINT NOT NULL, -- in cents
  currency VARCHAR(3) DEFAULT 'USD',
  interval VARCHAR(20) DEFAULT 'month', -- month, week, year
  purpose VARCHAR(100) DEFAULT 'general',
  
  -- Stripe
  stripe_subscription_id VARCHAR(255) NOT NULL UNIQUE,
  
  -- Status
  status subscription_status DEFAULT 'active',
  
  -- Dates
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paused_at TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  next_billing_date TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_mosque_id ON subscriptions(mosque_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);

-- ============================================================================
-- 7. PRAYER TIMES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS prayer_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mosque_id UUID NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
  
  -- Date
  prayer_date DATE NOT NULL,
  
  -- Prayer Times (in HH:MM format)
  fajr TIME NOT NULL,
  sunrise TIME NOT NULL,
  dhuhr TIME NOT NULL,
  asr TIME NOT NULL,
  maghrib TIME NOT NULL,
  isha TIME NOT NULL,
  
  -- Metadata
  hijri_date VARCHAR(50),
  islamic_month VARCHAR(50),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(mosque_id, prayer_date)
);

CREATE INDEX idx_prayer_times_mosque_id ON prayer_times(mosque_id);
CREATE INDEX idx_prayer_times_date ON prayer_times(prayer_date);
CREATE INDEX idx_prayer_times_mosque_date ON prayer_times(mosque_id, prayer_date);

-- ============================================================================
-- 8. EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mosque_id UUID NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  
  -- Event Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  
  -- Timing
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Visibility
  is_public BOOLEAN DEFAULT TRUE,
  
  -- Images
  image_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_events_mosque_id ON events(mosque_id);
CREATE INDEX idx_events_start_at ON events(start_at);
CREATE INDEX idx_events_mosque_date ON events(mosque_id, start_at);

-- ============================================================================
-- 9. ANNOUNCEMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mosque_id UUID NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  
  -- Content
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  
  -- Publishing
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Visibility
  is_pinned BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_announcements_mosque_id ON announcements(mosque_id);
CREATE INDEX idx_announcements_published_at ON announcements(published_at DESC);
CREATE INDEX idx_announcements_mosque_published ON announcements(mosque_id, is_published, published_at DESC);

-- ============================================================================
-- 10. REMINDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mosque_id UUID NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Reminder Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  reminder_type VARCHAR(50) NOT NULL, -- prayer, event, donation, announcement
  
  -- Scheduling
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Related Entity
  related_entity_id UUID,
  related_entity_type VARCHAR(50), -- prayer, event, etc
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reminders_mosque_id ON reminders(mosque_id);
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_scheduled_for ON reminders(scheduled_for);
CREATE INDEX idx_reminders_is_sent ON reminders(is_sent);

-- ============================================================================
-- 11. FEATURE FLAGS (Per-mosque feature control)
-- ============================================================================
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mosque_id UUID NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
  
  -- Flag Name
  flag_name VARCHAR(100) NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  config JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(mosque_id, flag_name)
);

CREATE INDEX idx_feature_flags_mosque_id ON feature_flags(mosque_id);
CREATE INDEX idx_feature_flags_flag_name ON feature_flags(flag_name);

-- ============================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE mosques ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mosque_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Mosques: Public read, only admins can modify
CREATE POLICY "Mosques are viewable by anyone" ON mosques
  FOR SELECT USING (TRUE);

CREATE POLICY "Only mosque admins can update their mosque" ON mosques
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM mosque_members
      WHERE mosque_members.mosque_id = mosques.id
      AND mosque_members.user_id = auth.uid()
      AND mosque_members.role IN ('mosque_admin', 'super_admin')
    )
  );

-- Users: Users can see their own profile
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Mosque Members: Users can see members of their mosques
CREATE POLICY "Users can see members of their mosques" ON mosque_members
  FOR SELECT USING (
    mosque_id IN (
      SELECT mosque_id FROM mosque_members WHERE user_id = auth.uid()
    )
  );

-- Donations: Users can see donations for their mosques
CREATE POLICY "Users can see donations for their mosques" ON donations
  FOR SELECT USING (
    mosque_id IN (
      SELECT mosque_id FROM mosque_members WHERE user_id = auth.uid()
    ) OR user_id = auth.uid()
  );

-- Events: Anyone can see public events
CREATE POLICY "Public events are viewable by anyone" ON events
  FOR SELECT USING (is_public = TRUE);

-- Announcements: Anyone can see published announcements
CREATE POLICY "Published announcements are viewable" ON announcements
  FOR SELECT USING (is_published = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

-- Reminders: Users can only see their own reminders
CREATE POLICY "Users can only see their own reminders" ON reminders
  FOR SELECT USING (user_id = auth.uid());

-- Prayer Times: Anyone can view prayer times
CREATE POLICY "Prayer times are viewable by anyone" ON prayer_times
  FOR SELECT USING (TRUE);

-- Feature Flags: Only admins can view/modify
CREATE POLICY "Only mosque admins can view feature flags" ON feature_flags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mosque_members
      WHERE mosque_members.mosque_id = feature_flags.mosque_id
      AND mosque_members.user_id = auth.uid()
      AND mosque_members.role IN ('mosque_admin', 'super_admin')
    )
  );
