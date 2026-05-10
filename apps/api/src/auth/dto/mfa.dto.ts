import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MfaVerifyDto {
  @ApiProperty({ example: '123456', description: 'The 6-digit code from the authenticator app' })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({ example: 'eyJhbGci...', description: 'The short-lived token returned from the login step' })
  @IsString()
  @IsNotEmpty()
  mfaToken!: string; 
}

export class MfaEnableDto {
  @ApiProperty({ example: '123456', description: 'The current TOTP code to verify setup' })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({ example: 'JBSWY3DPEHPK3PXP', description: 'The base32 secret generated during setup' })
  @IsString()
  @IsNotEmpty()
  secret!: string;
}
