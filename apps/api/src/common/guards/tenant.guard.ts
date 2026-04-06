import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../modules/supabase/supabase.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (request.tenantContext) {
      return true;
    }

    const url = request.originalUrl || request.url || '';
    const slugMatch = url.match(/\/mosques\/([^/?]+)/);
    if (!slugMatch) {
      throw new BadRequestException('Tenant context not found. Ensure the request includes a mosque slug.');
    }

    const slug = slugMatch[1];
    const { data: mosque, error } = await this.supabase.client
      .from('mosques')
      .select('id, slug')
      .eq('slug', slug)
      .single();

    if (error || !mosque) {
      throw new BadRequestException(`Mosque not found for slug: ${slug}`);
    }

    request.tenantContext = {
      mosque_id: mosque.id,
      mosque_slug: mosque.slug,
    };

    return true;
  }
}
