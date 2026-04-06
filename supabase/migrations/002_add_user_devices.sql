-- ============================================================================
-- Add push device token storage for mobile notifications
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mosque_id UUID NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
  device_token TEXT NOT NULL,
  platform VARCHAR(50) DEFAULT 'unknown',
  is_active BOOLEAN DEFAULT TRUE,
  last_failed_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_mosque_id ON user_devices(mosque_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_device_token ON user_devices(device_token);
