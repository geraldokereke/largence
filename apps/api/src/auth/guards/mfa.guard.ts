import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class MfaGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // If user has MFA enabled but hasn't verified it in this session
    if (user.mfaEnabled && !request.authInfo?.mfa_verified) {
      throw new ForbiddenException('MFA_REQUIRED');
    }

    return true;
  }
}
