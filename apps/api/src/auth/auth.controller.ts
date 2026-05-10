import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Organisation, User } from '@prisma/client';
import { CurrentOrg } from '../common/decorators/current-org.decorator';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { MfaEnableDto, MfaVerifyDto } from './dto/mfa.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleAuthGuard } from './guards/google.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { MicrosoftAuthGuard } from './guards/microsoft.guard';
import { SamlAuthGuard } from './guards/saml.guard';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(SamlAuthGuard)
  @Get('sso/saml')
  @ApiOperation({ summary: 'Initiate SAML SSO flow', description: 'Redirects the user to the configured identity provider.' })
  async samlAuth() {}

  @Public()
  @UseGuards(SamlAuthGuard)
  @Post('sso/saml/callback')
  @ApiOperation({ summary: 'SAML Callback handler' })
  async samlAuthCallback(
    @CurrentUser() user: User & { org: Organisation },
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.loginSocial(user, ip, userAgent || '');
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('social/google')
  @ApiOperation({ summary: 'Initiate Google OAuth flow' })
  async googleAuth(): Promise<void> {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('social/google/callback')
  @ApiOperation({ summary: 'Google OAuth Callback handler' })
  async googleAuthCallback(
    @CurrentUser() user: User & { org: Organisation },
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.loginSocial(user, ip, userAgent || '');
  }

  @Public()
  @UseGuards(MicrosoftAuthGuard)
  @Get('social/microsoft')
  @ApiOperation({ summary: 'Initiate Microsoft Social flow', description: 'Supports personal (Hotmail/Outlook) and Business accounts.' })
  async microsoftAuth(): Promise<void> {}

  @Public()
  @UseGuards(MicrosoftAuthGuard)
  @Get('social/microsoft/callback')
  @ApiOperation({ summary: 'Microsoft OAuth Callback handler' })
  async microsoftAuthCallback(
    @CurrentUser() user: User & { org: Organisation },
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.loginSocial(user, ip, userAgent || '');
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new law firm organisation', description: 'Creates the organisation and the first admin user.' })
  @ApiResponse({ status: 201, description: 'Organisation and user successfully created.' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login', description: 'Returns access tokens or an mfaToken if 2FA is required.' })
  @ApiResponse({ status: 200, description: 'Login successful.' })
  async login(
    @Body() dto: LoginDto,
    @CurrentOrg() org: Organisation | null,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.login(dto, org, ip, userAgent || '');
  }

  @Public()
  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify MFA code', description: 'Completes the login process using the mfaToken and TOTP code.' })
  async verifyMfa(
    @Body() dto: MfaVerifyDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.mfaVerify(dto, ip, userAgent || '');
  }

  @Post('mfa/setup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Setup MFA', description: 'Generates a new TOTP secret and QR code for the user.' })
  async mfaSetup(@CurrentUser() user: User) {
    return this.authService.setupMfa(user);
  }

  @Post('mfa/enable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enable MFA', description: 'Finalizes MFA enrollment after verifying a code.' })
  async mfaEnable(@CurrentUser() user: User, @Body() dto: MfaEnableDto) {
    return this.authService.enableMfa(user, dto.token, dto.secret);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate access tokens', description: 'Uses a valid refresh token to obtain a new access token.' })
  async refresh(
    @Body('refreshToken') refreshToken: string,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.refreshTokens(refreshToken, ip, userAgent || '');
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout user', description: 'Invalidates the refresh token and clears the session.' })
  async logout(@Body('refreshToken') refreshToken: string) {
    await this.authService.logout(refreshToken);
  }

  @Public()
  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email address' })
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current session context', description: 'Returns the current user and organisation details.' })
  me(@CurrentUser() user: User, @CurrentOrg() org: Organisation | null) {
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        emailVerified: user.emailVerified,
      },
      organisation: org
        ? {
            id: org.id,
            name: org.name,
            slug: org.slug,
          }
        : null,
    };
  }
}
