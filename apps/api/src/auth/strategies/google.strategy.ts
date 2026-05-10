import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Profile, Strategy } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || 'stub',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'stub',
      callbackURL: `https://auth.${process.env.BASE_DOMAIN}/auth/social/google/callback`,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<any> {
    const host = req.headers.host || '';
    const orgSlug = host.split('.')[0];

    const socialProfile = {
      id: profile.id,
      emails: profile.emails || [],
      name: {
        givenName: profile.name?.givenName || '',
        familyName: profile.name?.familyName || '',
      },
    };

    const user = await this.authService.validateSocialLogin(socialProfile, 'google', orgSlug);
    return user;
  }
}
