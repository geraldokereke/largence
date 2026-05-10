import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { MultiSamlStrategy, Profile, SamlConfig } from 'passport-saml';
import { AuthService, SocialProfile } from '../auth.service';
import { SsoService } from '../sso.service';

@Injectable()
export class SamlStrategy extends PassportStrategy(MultiSamlStrategy, 'saml') {
  constructor(
    private ssoService: SsoService,
    private authService: AuthService,
  ) {
    super({
      passReqToCallback: true,
      getSamlOptions: (req, callback) => {
        const host = req.headers.host || '';
        const orgSlug = host.split('.')[0];

        this.ssoService
          .getSamlConfig(orgSlug)
          .then(config => callback(null, config as SamlConfig))
          .catch(err => callback(err));
      },
    });
  }

  async validate(req: Request, profile: Profile): Promise<any> {
    const host = req.headers.host || '';
    const orgSlug = host.split('.')[0];

    const profileRecord = profile as Record<string, unknown>;

    const socialProfile: SocialProfile = {
      id: profile.nameID || '',
      emails: [
        {
          value: (profile.email as string) || (profileRecord.mail as string) || '',
        },
      ],
      name: {
        givenName: (profile.firstName as string) || (profileRecord.givenName as string) || '',
        familyName: (profile.lastName as string) || (profileRecord.sn as string) || '',
      },
    };

    return this.authService.validateSocialLogin(socialProfile, 'saml', orgSlug);
  }
}
