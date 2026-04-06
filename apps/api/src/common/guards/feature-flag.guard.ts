import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupabaseService } from '../../modules/supabase/supabase.service';

export const FEATURE_KEY = 'feature';
export const RequiresFeature = (feature: string) =>
  (target: any, key?: string | symbol, descriptor?: any) => {
    Reflect.defineMetadata(FEATURE_KEY, feature, descriptor?.value ?? target);
    return descriptor ?? target;
  };

@Injectable()
export class FeatureFlagGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private supabase: SupabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.get<string>(FEATURE_KEY, context.getHandler());
    if (!feature) return true; // no feature requirement — pass through

    const request = context.switchToHttp().getRequest();
    const tenantContext = request.tenantContext;
    if (!tenantContext) return true; // tenant middleware handles this separately

    const flagKey = feature.endsWith('_enabled') ? feature : `${feature}_enabled`;
    const { data } = await this.supabase.client
      .from('feature_flags')
      .select('is_enabled')
      .eq('mosque_id', tenantContext.mosque_id)
      .eq('flag_name', flagKey)
      .single();

    if (!data?.is_enabled) {
      throw new BadRequestException({
        code: 'FEATURE_DISABLED',
        message: `The '${feature}' feature is not enabled for this mosque`,
      });
    }

    return true;
  }
}
