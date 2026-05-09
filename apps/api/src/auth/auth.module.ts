import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { PasswordService } from './password.service';
import { MfaService } from './mfa.service';
import { EmailService } from './email.service';
import { AuditService } from './audit.service';
import { CryptoService } from './crypto.service';
import { OnboardingService } from './onboarding.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { KafkaService } from '../kafka/kafka.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      privateKey: process.env.JWT_PRIVATE_KEY,
      publicKey: process.env.JWT_PUBLIC_KEY,
      signOptions: { algorithm: 'RS256' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    PasswordService,
    MfaService,
    EmailService,
    AuditService,
    CryptoService,
    OnboardingService,
    JwtStrategy,
    GoogleStrategy,
    PrismaService,
    RedisService,
    KafkaService,
  ],
  exports: [AuthService, TokenService, JwtStrategy, PassportModule],
})
export class AuthModule {}
