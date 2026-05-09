import { Controller, Post, Body, Get, UseGuards, Req, Ip, Headers, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MfaVerifyDto } from './dto/mfa.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { CurrentOrg } from '../common/decorators/current-org.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Organisation, User } from '@prisma/client';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @CurrentOrg() org: Organisation,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.login(dto, org, ip, userAgent || '');
  }

  @Public()
  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  async mfaVerify(
    @Body() dto: MfaVerifyDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    // Note: In a real app, we'd verify the mfaToken (e.g. from Redis) to get the userId
    // For now, this is a placeholder for the full flow
    return this.authService.mfaVerify(dto.token, 'user-id-from-token', ip, userAgent || '');
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    return this.authService.refreshTokens(refreshToken, ip, userAgent || '');
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: User) {
    return user;
  }

  @Public()
  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
