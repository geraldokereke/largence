import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrgType } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'partner@vestra-law.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'P@ssw0rdSecure!', description: 'Minimum 12 characters' })
  @IsString()
  @MinLength(12)
  password!: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ example: 'Vestra Law Firm', description: 'The name of the new organisation' })
  @IsString()
  @IsNotEmpty()
  orgName!: string;

  @ApiProperty({ enum: OrgType, example: OrgType.LAW_FIRM })
  @IsEnum(OrgType)
  orgType!: OrgType;

  @ApiPropertyOptional({ default: false, description: 'If true, creates a sandbox environment' })
  @IsOptional()
  isSandbox?: boolean;
}
