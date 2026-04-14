import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables from apps/api/.env
config({ path: join(__dirname, '..', 'apps', 'api', '.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ============================================================================
// SEED DATA
// ============================================================================

const SUPERADMIN_EMAIL = 'admin@mosqueos.local';
const SUPERADMIN_PASSWORD = 'SuperAdmin123!@#';

const MOSQUES = [
  {
    name: 'Al-Noor Islamic Center',
    slug: 'al-noor-houston',
    city: 'Houston',
    state: 'TX',
    timezone: 'America/Chicago',
    ein: '12-3456789',
    calculation_method: 'isna',
    madhab: 'hanafi',
    stripe_account_id: 'acct_mock_alnoor',
    stripe_charges_enabled: true,
    stripe_payouts_enabled: true,
  },
  {
    name: 'Masjid Manhattan',
    slug: 'masjid-manhattan',
    city: 'New York',
    state: 'NY',
    timezone: 'America/New_York',
    ein: '98-7654321',
    calculation_method: 'mwl',
    madhab: 'shafi',
    stripe_account_id: 'acct_mock_manhattan',
    stripe_charges_enabled: true,
    stripe_payouts_enabled: true,
  },
  {
    name: 'Islamic Center of San Francisco',
    slug: 'masjid-sf',
    city: 'San Francisco',
    state: 'CA',
    timezone: 'America/Los_Angeles',
    ein: '55-5555555',
    calculation_method: 'isna',
    madhab: 'hanafi',
    stripe_account_id: 'acct_mock_sf',
    stripe_charges_enabled: true,
    stripe_payouts_enabled: true,
  },
];

const TEST_USERS = [
  {
    email: 'admin@mosqueos.local',
    password: 'SuperAdmin123!@#',
    full_name: 'Tareque Admin',
    global_role: 'super_admin',
    mosque_role: null,
  },
  {
    email: 'admin.alnoor@mosqueos.local',
    password: 'MosqueAdmin123!@#',
    full_name: 'Ahmad Al-Noor',
    global_role: 'member',
    mosque_role: 'mosque_admin',
    mosque_slug: 'al-noor-houston',
  },
  {
    email: 'admin.manhattan@mosqueos.local',
    password: 'MosqueAdmin123!@#',
    full_name: 'Fatima Manhattan',
    global_role: 'member',
    mosque_role: 'mosque_admin',
    mosque_slug: 'masjid-manhattan',
  },
  {
    email: 'member@alnoor.local',
    password: 'Member123!@#',
    full_name: 'Hassan Member',
    global_role: 'member',
    mosque_role: 'member',
    mosque_slug: 'al-noor-houston',
  },
  {
    email: 'donor@alnoor.local',
    password: 'Donor123!@#',
    full_name: 'Zainab Donor',
    global_role: 'donor',
    mosque_role: 'member',
    mosque_slug: 'al-noor-houston',
  },
];

interface Mosque {
  id: string;
  name: string;
  slug: string;
}

interface AuthUser {
  user: {
    id: string;
  };
}

async function seedDatabase() {
  console.log('🌱 Starting MosqueOS database seed...\n');

  try {
    // ========================================================================
    // 1. CREATE MOSQUES
    // ========================================================================
    console.log('📍 Creating mosques...');
    const mosques: Mosque[] = [];

    for (const mosqueSeed of MOSQUES) {
      const { data, error } = await supabase
        .from('mosques')
        .insert([mosqueSeed])
        .select()
        .single();

      if (error) {
        console.error(`   ❌ Failed to create mosque: ${error.message}`);
        continue;
      }

      mosques.push(data as Mosque);
      console.log(`   ✅ Created mosque: ${data.name} (${data.slug})`);
    }

    // ========================================================================
    // 2. CREATE USERS & ASSIGN TO MOSQUES
    // ========================================================================
    console.log('\n👥 Creating test users...');

    for (const userSeed of TEST_USERS) {
      // Create auth user with metadata
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userSeed.email,
        password: userSeed.password,
        email_confirm: true,
        user_metadata: {
          mosque_slug: userSeed.mosque_slug || null,
          global_role: userSeed.global_role,
          full_name: userSeed.full_name,
        },
      });

      if (authError) {
        console.error(`   ❌ Failed to create auth user ${userSeed.email}: ${authError.message}`);
        continue;
      }

      const userId = (authData as AuthUser).user.id;

      // Create user profile
      const { error: profileError } = await supabase.from('users').insert({
        id: userId,
        email: userSeed.email,
        full_name: userSeed.full_name,
        global_role: userSeed.global_role,
      });

      if (profileError) {
        console.error(`   ❌ Failed to create user profile: ${profileError.message}`);
        continue;
      }

      // Assign to mosque if applicable
      if (userSeed.mosque_slug) {
        const mosque = mosques.find((m) => m.slug === userSeed.mosque_slug);
        if (mosque) {
          const { error: memberError } = await supabase.from('mosque_members').insert({
            user_id: userId,
            mosque_id: mosque.id,
            role: userSeed.mosque_role,
            is_active: true,
            invitation_accepted_at: new Date().toISOString(),
          });

          if (memberError) {
            console.error(`   ❌ Failed to add user to mosque: ${memberError.message}`);
            continue;
          }
        }
      }

      console.log(`   ✅ Created user: ${userSeed.full_name} (${userSeed.email})`);
    }

    // ========================================================================
    // 3. CREATE FEATURE FLAGS
    // ========================================================================
    console.log('\n🚩 Creating feature flags...');

    const flags = [
      { flag_name: 'donations_enabled', is_enabled: true },
      { flag_name: 'events_enabled', is_enabled: true },
      { flag_name: 'announcements_enabled', is_enabled: true },
      { flag_name: 'prayer_times_enabled', is_enabled: true },
      { flag_name: 'reminders_enabled', is_enabled: true },
    ];

    for (const mosque of mosques) {
      for (const flag of flags) {
        const { error } = await supabase.from('feature_flags').insert({
          mosque_id: mosque.id,
          flag_name: flag.flag_name,
          is_enabled: flag.is_enabled,
        });

        if (error) {
          console.error(`   ❌ Failed to create flag: ${error.message}`);
        }
      }
      console.log(`   ✅ Created feature flags for ${mosque.name}`);
    }

    // ========================================================================
    // 4. CREATE SAMPLE DONATIONS
    // ========================================================================
    console.log('\n💰 Creating sample donations...');

    const donations = [
      {
        mosque_slug: 'al-noor-houston',
        amount: 10000, // $100
        donation_type: 'one_time',
        purpose: 'general',
        donor_name: 'Anonymous',
        donor_email: 'anon@example.com',
      },
      {
        mosque_slug: 'al-noor-houston',
        amount: 5000, // $50
        donation_type: 'monthly',
        purpose: 'building_fund',
        donor_name: 'Hassan Member',
        donor_email: 'member@alnoor.local',
      },
      {
        mosque_slug: 'masjid-manhattan',
        amount: 15000, // $150
        donation_type: 'one_time',
        purpose: 'education',
        donor_name: 'Zainab Donor',
        donor_email: 'donor@example.com',
      },
      {
        mosque_slug: 'masjid-sf',
        amount: 20000, // $200
        donation_type: 'one_time',
        purpose: 'general',
        donor_name: 'Community Member',
        donor_email: 'community@example.com',
      },
    ];

    for (const donationSeed of donations) {
      const mosque = mosques.find((m) => m.slug === donationSeed.mosque_slug);
      if (!mosque) continue;

      const { error } = await supabase.from('donations').insert({
        mosque_id: mosque.id,
        amount: donationSeed.amount,
        currency: 'USD',
        donation_type: donationSeed.donation_type,
        purpose: donationSeed.purpose,
        donor_name: donationSeed.donor_name,
        donor_email: donationSeed.donor_email,
        status: 'completed',
      });

      if (error) {
        console.error(`   ❌ Failed to create donation: ${error.message}`);
      }
    }
    console.log(`   ✅ Created ${donations.length} sample donations`);

    // ========================================================================
    // 5. CREATE PRAYER TIMES (30 days)
    // ========================================================================
    console.log('\n📿 Creating prayer times...');

    const today = new Date();
    const prayerTimesData: any[] = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      for (const mosque of mosques) {
        prayerTimesData.push({
          mosque_id: mosque.id,
          prayer_date: dateStr,
          fajr: `05:${String(30 + (i % 15)).padStart(2, '0')}`,
          sunrise: `07:${String(15 + (i % 15)).padStart(2, '0')}`,
          dhuhr: `12:${String(30 + (i % 15)).padStart(2, '0')}`,
          asr: `15:${String(45 + (i % 10)).padStart(2, '0')}`,
          maghrib: `18:${String(20 + (i % 15)).padStart(2, '0')}`,
          isha: `19:${String(30 + (i % 15)).padStart(2, '0')}`,
          hijri_date: `15 Rajab 1445`,
          islamic_month: 'Rajab',
        });
      }
    }

    const { error: prayerError } = await supabase.from('prayer_times').insert(prayerTimesData);

    if (prayerError) {
      console.error(`   ❌ Failed to create prayer times: ${prayerError.message}`);
    } else {
      console.log(`   ✅ Created prayer times for next 30 days`);
    }

    // ========================================================================
    // 6. CREATE SAMPLE EVENTS
    // ========================================================================
    console.log('\n📅 Creating sample events...');

    const eventSeed = {
      title: 'Ramadan Iftar',
      description: 'Join us for Iftar during Ramadan',
      location: 'Main Hall',
    };

    for (const mosque of mosques) {
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + 10);

      const { error } = await supabase.from('events').insert({
        mosque_id: mosque.id,
        created_by: (await supabase.from('mosque_members')
          .select('user_id')
          .eq('mosque_id', mosque.id)
          .eq('role', 'mosque_admin')
          .limit(1)
          .single()
          .then((r) => r.data?.user_id)) || null,
        title: eventSeed.title,
        description: eventSeed.description,
        location: eventSeed.location,
        start_at: eventDate.toISOString(),
        end_at: new Date(eventDate.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        is_public: true,
      });

      if (error) {
        console.error(`   ❌ Failed to create event: ${error.message}`);
      }
    }
    console.log(`   ✅ Created sample events for each mosque`);

    // ========================================================================
    // 7. CREATE SAMPLE ANNOUNCEMENTS
    // ========================================================================
    console.log('\n📢 Creating sample announcements...');

    const announcementSeed = {
      title: 'New Prayer Schedule',
      content: 'Our prayer schedule has been updated for the summer. Please check the website for the latest times.',
    };

    for (const mosque of mosques) {
      const { error } = await supabase.from('announcements').insert({
        mosque_id: mosque.id,
        created_by: (await supabase.from('mosque_members')
          .select('user_id')
          .eq('mosque_id', mosque.id)
          .eq('role', 'mosque_admin')
          .limit(1)
          .single()
          .then((r) => r.data?.user_id)) || null,
        title: announcementSeed.title,
        content: announcementSeed.content,
        is_published: true,
        published_at: new Date().toISOString(),
      });

      if (error) {
        console.error(`   ❌ Failed to create announcement: ${error.message}`);
      }
    }
    console.log(`   ✅ Created sample announcements`);

    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log('\n✨ Seed completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - ${mosques.length} mosques created`);
    console.log(`   - ${TEST_USERS.length} users created`);
    console.log(`   - ${flags.length * mosques.length} feature flags created`);
    console.log(`   - ${donations.length} donations created`);
    console.log(`   - ${prayerTimesData.length} prayer times created`);
    console.log(`   - ${mosques.length} events created`);
    console.log(`   - ${mosques.length} announcements created`);

    console.log('\n🔐 Super Admin Credentials:');
    console.log(`   Email: ${SUPERADMIN_EMAIL}`);
    console.log(`   Password: ${SUPERADMIN_PASSWORD}`);
    console.log(`   (Save these securely!)\n`);

    console.log('🚀 You can now log in to the admin dashboard at http://localhost:3000\n');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedDatabase();
