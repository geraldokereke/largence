import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Organisation } from '@prisma/client';

export const CurrentOrg = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Organisation | null => {
    const request = ctx.switchToHttp().getRequest();
    return request.org || null;
  },
);
