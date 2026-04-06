import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface TenantContext {
  mosque_id: string;
  mosque_slug: string;
  plan?: string;
}

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TenantContext => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantContext;
  },
);
