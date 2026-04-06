import { Injectable, NestMiddleware, BadRequestException, Logger } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { SupabaseService } from '../../modules/supabase/supabase.service';

export interface TenantContext {
  mosque_id: string;
  mosque_slug: string;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantMiddleware.name);

  constructor(private supabase: SupabaseService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Match routes with :slug parameter (handles both / and /api prefix)
    const slugMatch = req.path.match(/\/mosques\/([^/?]+)/);
    
    if (!slugMatch) {
      // Not a mosque-specific route, continue
      return next();
    }

    const slug = slugMatch[1];
    this.logger.debug(`🔍 Resolving tenant for slug: ${slug}`);

    try {
      // Look up mosque by slug
      const { data: mosque, error } = await this.supabase.client
        .from('mosques')
        .select('id, slug')
        .eq('slug', slug)
        .single();

      if (error || !mosque) {
        this.logger.warn(`❌ Mosque not found for slug: ${slug}`);
        throw new BadRequestException(`Mosque not found for slug: ${slug}`);
      }

      // Set tenant context on request
      (req as any).tenantContext = {
        mosque_id: mosque.id,
        mosque_slug: mosque.slug,
      };

      this.logger.debug(`✅ Tenant set: ${mosque.id}`);
      next();
    } catch (err) {
      this.logger.error(`❌ Middleware error: ${err instanceof Error ? err.message : String(err)}`);
      throw new BadRequestException('Failed to resolve tenant context');
    }
  }
}
