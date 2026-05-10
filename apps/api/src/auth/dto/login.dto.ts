import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'solicitor@largence.com', description: 'The registered email address' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Password123!', description: 'The user password' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiPropertyOptional({ example: 'dev-iphone-12', description: 'Used for device fingerprinting and session management' })
  @IsOptional()
  @IsString()
  deviceId?: string;
}
