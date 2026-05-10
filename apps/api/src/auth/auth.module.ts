import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { KafkaService } from '../kafka/kafka.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { AuditService } from './audit.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CryptoService } from './crypto.service';
import { EmailService } from './email.service';
import { MfaService } from './mfa.service';
import { OnboardingService } from './onboarding.service';
import { PasswordService } from './password.service';
import { SsoService } from './sso.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MicrosoftStrategy } from './strategies/microsoft.strategy';
import { SamlStrategy } from './strategies/saml.strategy';
import { TokenService } from './token.service';

import { InvitesController } from './invites.controller';
import { InvitesService } from './invites.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      privateKey: process.env.JWT_PRIVATE_KEY,
      publicKey: process.env.JWT_PUBLIC_KEY,
      signOptions: { algorithm: 'RS256' },
    }),
  ],
  controllers: [AuthController, InvitesController],
  providers: [
    AuthService,
    InvitesService,
    SsoService,
    TokenService,
    PasswordService,
    MfaService,
    EmailService,
    AuditService,
    CryptoService,
    OnboardingService,
    JwtStrategy,
    GoogleStrategy,
    MicrosoftStrategy,
    SamlStrategy,
    PrismaService,
    RedisService,
    KafkaService,
  ],
  exports: [AuthService, InvitesService, CryptoService, TokenService, JwtStrategy, PassportModule],
})
export class AuthModule {}
