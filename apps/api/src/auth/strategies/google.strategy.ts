import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || 'stub',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'stub',
      callbackURL: 'https://auth.largence.com/auth/social/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    // TODO: Implement JIT provisioning
    return profile;
  }
}
