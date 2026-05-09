import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class MfaVerifyDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @IsNotEmpty()
  mfaToken!: string; // The short-lived token from login step
}
