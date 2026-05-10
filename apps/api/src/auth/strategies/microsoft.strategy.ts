import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-microsoft';
import { AuthService } from '../auth.service';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.MICROSOFT_CLIENT_ID || 'stub',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || 'stub',
      callbackURL: `https://api.${process.env.BASE_DOMAIN}/auth/social/microsoft/callback`,
      scope: ['user.read', 'openid', 'profile', 'email'],
      tenant: 'common', // Allows both personal and business accounts
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const host = req.headers.host || '';
    const orgSlug = host.split('.')[0];

    // passport-microsoft profile normalization
    const socialProfile = {
      id: profile.id,
      emails: profile.emails || [{ value: profile.userPrincipalName }],
      name: {
        givenName: profile.name?.givenName || profile.displayName?.split(' ')[0] || '',
        familyName: profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '',
      },
    };

    const user = await this.authService.validateSocialLogin(socialProfile, 'microsoft', orgSlug);
    return user;
  }
}
