-- ============================================================================
-- MuslimNoor SaaS - Local Development Seed Data
-- ============================================================================

-- Seed Mosques
INSERT INTO mosques (id, name, slug, city, state, timezone, ein, calculation_method, madhab, donations_enabled, events_enabled, announcements_enabled, prayer_times_enabled)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Islamic Center of Chicago', 'icc-chicago', 'Chicago', 'IL', 'America/Chicago', '12-3456789', 'isna', 'hanafi', TRUE, TRUE, TRUE, TRUE),
  ('a1000000-0000-0000-0000-000000000002', 'Muslim Community of Dallas', 'mcd-dallas', 'Dallas', 'TX', 'America/Chicago', '98-7654321', 'isna', 'shafi', TRUE, TRUE, TRUE, TRUE),
  ('a1000000-0000-0000-0000-000000000003', 'Bay Area Islamic Society', 'bais-sf', 'San Francisco', 'CA', 'America/Los_Angeles', '55-1234567', 'mwl', 'hanafi', TRUE, TRUE, TRUE, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- Auth Users (inserted directly into Supabase auth schema for local dev)
-- Passwords are hashed using bcrypt with cost factor 10.
-- All passwords below are:  SuperAdmin123!@#  (super_admin)
--                           MosqueAdmin123!@# (mosque_admin users)
--                           Member123!@#      (member)
--                           Donor123!@#       (donor)
-- ============================================================================

-- Super Admin
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, invited_at, confirmation_token,
  recovery_token, email_change_token_new, email_change,
  last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
  is_super_admin, created_at, updated_at, phone, phone_confirmed_at,
  confirmation_sent_at, email_change_sent_at, recovery_sent_at,
  banned_until, reauthentication_token, reauthentication_sent_at,
  is_sso_user, deleted_at
)
VALUES
  (
    'b1000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'admin@muslimnoor.local',
    crypt('SuperAdmin123!@#', gen_salt('bf')),
    NOW(), NULL, '', '', '', '',
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Tareque Admin","global_role":"super_admin"}',
    FALSE, NOW(), NOW(),
    NULL, NULL, NULL, NULL, NULL, NULL, '', NULL, FALSE, NULL
  ),
  (
    'b1000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'admin.chicago@muslimnoor.local',
    crypt('MosqueAdmin123!@#', gen_salt('bf')),
    NOW(), NULL, '', '', '', '',
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Ahmad Al-Noor","global_role":"mosque_admin"}',
    FALSE, NOW(), NOW(),
    NULL, NULL, NULL, NULL, NULL, NULL, '', NULL, FALSE, NULL
  ),
  (
    'b1000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'admin.dallas@muslimnoor.local',
    crypt('MosqueAdmin123!@#', gen_salt('bf')),
    NOW(), NULL, '', '', '', '',
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Fatima Dallas","global_role":"mosque_admin"}',
    FALSE, NOW(), NOW(),
    NULL, NULL, NULL, NULL, NULL, NULL, '', NULL, FALSE, NULL
  ),
  (
    'b1000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'member@muslimnoor.local',
    crypt('Member123!@#', gen_salt('bf')),
    NOW(), NULL, '', '', '', '',
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Hassan Member","global_role":"member"}',
    FALSE, NOW(), NOW(),
    NULL, NULL, NULL, NULL, NULL, NULL, '', NULL, FALSE, NULL
  ),
  (
    'b1000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'donor@muslimnoor.local',
    crypt('Donor123!@#', gen_salt('bf')),
    NOW(), NULL, '', '', '', '',
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Zainab Donor","global_role":"donor"}',
    FALSE, NOW(), NOW(),
    NULL, NULL, NULL, NULL, NULL, NULL, '', NULL, FALSE, NULL
  )
ON CONFLICT (id) DO NOTHING;

-- Create identity records (required for Supabase auth to work)
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'admin@muslimnoor.local',     '{"sub":"b1000000-0000-0000-0000-000000000001","email":"admin@muslimnoor.local"}',         'email', NOW(), NOW(), NOW()),
  ('b1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 'admin.chicago@muslimnoor.local', '{"sub":"b1000000-0000-0000-0000-000000000002","email":"admin.chicago@muslimnoor.local"}', 'email', NOW(), NOW(), NOW()),
  ('b1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003', 'admin.dallas@muslimnoor.local',  '{"sub":"b1000000-0000-0000-0000-000000000003","email":"admin.dallas@muslimnoor.local"}',  'email', NOW(), NOW(), NOW()),
  ('b1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004', 'member@muslimnoor.local',    '{"sub":"b1000000-0000-0000-0000-000000000004","email":"member@muslimnoor.local"}',         'email', NOW(), NOW(), NOW()),
  ('b1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000005', 'donor@muslimnoor.local',     '{"sub":"b1000000-0000-0000-0000-000000000005","email":"donor@muslimnoor.local"}',         'email', NOW(), NOW(), NOW())
ON CONFLICT (provider, provider_id) DO NOTHING;

-- User profiles in public.users table
INSERT INTO users (id, email, full_name, global_role, email_notifications_enabled, created_at, updated_at)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'admin@muslimnoor.local',         'Tareque Admin',  'super_admin',   TRUE, NOW(), NOW()),
  ('b1000000-0000-0000-0000-000000000002', 'admin.chicago@muslimnoor.local', 'Ahmad Al-Noor',  'mosque_admin',  TRUE, NOW(), NOW()),
  ('b1000000-0000-0000-0000-000000000003', 'admin.dallas@muslimnoor.local',  'Fatima Dallas',  'mosque_admin',  TRUE, NOW(), NOW()),
  ('b1000000-0000-0000-0000-000000000004', 'member@muslimnoor.local',        'Hassan Member',  'member',        TRUE, NOW(), NOW()),
  ('b1000000-0000-0000-0000-000000000005', 'donor@muslimnoor.local',         'Zainab Donor',   'donor',         TRUE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Mosque memberships
INSERT INTO mosque_members (user_id, mosque_id, role, is_active, invitation_accepted_at)
VALUES
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'mosque_admin', TRUE, NOW()),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'mosque_admin', TRUE, NOW()),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'member',       TRUE, NOW()),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'member',       TRUE, NOW())
ON CONFLICT DO NOTHING;

-- Seed Prayer Times (today and next 3 days)
INSERT INTO prayer_times (mosque_id, prayer_date, fajr, sunrise, dhuhr, asr, maghrib, isha)
VALUES
  ('a1000000-0000-0000-0000-000000000001', CURRENT_DATE,       '05:12', '06:38', '12:52', '16:24', '19:06', '20:30'),
  ('a1000000-0000-0000-0000-000000000001', CURRENT_DATE + 1,   '05:11', '06:37', '12:52', '16:25', '19:07', '20:31'),
  ('a1000000-0000-0000-0000-000000000001', CURRENT_DATE + 2,   '05:10', '06:36', '12:52', '16:25', '19:08', '20:32'),
  ('a1000000-0000-0000-0000-000000000001', CURRENT_DATE + 3,   '05:09', '06:35', '12:52', '16:26', '19:09', '20:33'),
  ('a1000000-0000-0000-0000-000000000002', CURRENT_DATE,       '05:30', '06:50', '13:05', '16:40', '19:20', '20:45'),
  ('a1000000-0000-0000-0000-000000000002', CURRENT_DATE + 1,   '05:29', '06:49', '13:05', '16:41', '19:21', '20:46'),
  ('a1000000-0000-0000-0000-000000000003', CURRENT_DATE,       '05:45', '07:05', '13:15', '16:50', '19:35', '21:00'),
  ('a1000000-0000-0000-0000-000000000003', CURRENT_DATE + 1,   '05:44', '07:04', '13:15', '16:51', '19:36', '21:01')
ON CONFLICT DO NOTHING;

-- Sample donations
INSERT INTO donations (mosque_id, amount, currency, donation_type, purpose, donor_name, donor_email, status, created_at)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 10000, 'USD', 'one_time', 'general',       'Anonymous',    'anon@example.com',      'completed', NOW() - INTERVAL '5 days'),
  ('a1000000-0000-0000-0000-000000000001', 5000,  'USD', 'monthly',  'building_fund', 'Hassan Member','member@muslimnoor.local','completed', NOW() - INTERVAL '10 days'),
  ('a1000000-0000-0000-0000-000000000002', 15000, 'USD', 'one_time', 'education',     'Zainab Donor', 'donor@muslimnoor.local', 'completed', NOW() - INTERVAL '3 days'),
  ('a1000000-0000-0000-0000-000000000003', 20000, 'USD', 'one_time', 'general',       'Community',    'community@example.com',  'completed', NOW() - INTERVAL '1 day'),
  ('a1000000-0000-0000-0000-000000000001', 7500,  'USD', 'monthly',  'zakat',         'Ibrahim Ali',  'ibrahim@example.com',    'pending',   NOW())
ON CONFLICT DO NOTHING;

-- Sample events
INSERT INTO events (mosque_id, created_by, title, description, location, start_at, end_at, is_public)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'Ramadan Iftar Night', 'Join us for a community Iftar dinner during the blessed month of Ramadan.', 'Main Hall', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '3 hours', TRUE),
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003', 'Eid Prayer', 'Eid Al-Fitr prayer and celebration for the whole community.', 'Main Musallah', NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days' + INTERVAL '2 hours', TRUE),
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'Youth Halaqa', 'Weekly youth Islamic study circle. All teens welcome.', 'Room 101', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '90 minutes', TRUE)
ON CONFLICT DO NOTHING;

-- Sample announcements
INSERT INTO announcements (mosque_id, created_by, title, content, is_published, published_at, is_pinned)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'New Prayer Schedule', 'Our prayer schedule has been updated. Please check the website for the latest times.', TRUE, NOW(), TRUE),
  ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003', 'Ramadan Mubarak!', 'Wishing all community members a blessed Ramadan. May Allah accept our fasts and prayers.', TRUE, NOW(), FALSE),
  ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'Building Fund Update', 'Alhamdulillah! We have reached 60% of our building renovation goal. Jazakallah khair for your generous donations.', TRUE, NOW(), FALSE)
ON CONFLICT DO NOTHING;
