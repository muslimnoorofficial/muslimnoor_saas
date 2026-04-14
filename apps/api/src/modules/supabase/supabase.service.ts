import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);

  // Public client uses anon key (respects RLS)
  public client: SupabaseClient;
  // Admin client uses service-role key (bypasses RLS — use only server-side)
  public admin: SupabaseClient;

  onModuleInit() {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !anonKey || !serviceKey) {
      this.logger.error('Missing Supabase env vars: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY');
      throw new Error('Supabase configuration is incomplete. Check your .env file.');
    }

    this.client = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    this.admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    this.logger.log(`✅ Supabase connected → ${url}`);
  }

  /** Return a client scoped to a specific user JWT (respects RLS per user) */
  forUser(accessToken: string): SupabaseClient {
    const url = process.env.SUPABASE_URL!;
    const anonKey = process.env.SUPABASE_ANON_KEY!;
    return createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
  }

  /** Legacy helper kept for compatibility */
  getClient(): SupabaseClient {
    return this.client;
  }

  /** Extract user ID from a Supabase JWT */
  async extractUserIdFromToken(token: string): Promise<string | null> {
    try {
      const { data, error } = await this.admin.auth.getUser(token);
      if (error || !data?.user) return null;
      return data.user.id;
    } catch {
      return null;
    }
  }

  /** Fetch a user profile from the users table */
  async getUserById(id: string) {
    const { data } = await this.admin.from('users').select('*').eq('id', id).single();
    return data;
  }
}
