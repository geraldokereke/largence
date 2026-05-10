import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Organisation } from '@prisma/client';
import { RequestWithUser } from '../../auth/decorators/current-user.decorator';

export const CurrentOrg = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Organisation | null => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.org || null;
  },
);
