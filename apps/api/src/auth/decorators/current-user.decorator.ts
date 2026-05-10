import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Organisation, User } from '@prisma/client';
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: User;
  org?: Organisation;
  isPublicTenant?: boolean;
  authInfo?: {
    mfa_verified: boolean;
  };
}

export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
