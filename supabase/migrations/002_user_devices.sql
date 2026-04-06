-- ====================================
-- User Devices Table Migration
-- ====================================
-- This table stores Firebase Cloud Messaging (FCM) tokens for push notifications
-- Run this migration in Supabase SQL editor or via migrations folder

CREATE TABLE IF NOT EXISTS user_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign key to users table
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Device identification
  device_id TEXT NOT NULL UNIQUE,
  device_token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  
  -- Token status tracking
  is_active BOOLEAN DEFAULT true,
  last_failure_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure only one active token per device
  CONSTRAINT active_device_per_user UNIQUE (user_id, device_id) WHERE is_active = true
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_device_token ON user_devices(device_token);
CREATE INDEX IF NOT EXISTS idx_user_devices_is_active ON user_devices(is_active);
CREATE INDEX IF NOT EXISTS idx_user_devices_platform ON user_devices(platform);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_user_devices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_devices_updated_at_trigger
BEFORE UPDATE ON user_devices
FOR EACH ROW
EXECUTE FUNCTION update_user_devices_updated_at();

-- Add Row Level Security (RLS) policies
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;

-- Users can only see their own devices
CREATE POLICY "Users can view own devices"
  ON user_devices
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Users can only insert their own devices
CREATE POLICY "Users can insert own devices"
  ON user_devices
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can only update their own devices
CREATE POLICY "Users can update own devices"
  ON user_devices
  FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Users can only delete their own devices
CREATE POLICY "Users can delete own devices"
  ON user_devices
  FOR DELETE
  USING (auth.uid()::text = user_id::text);
