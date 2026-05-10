import { OnboardingMode, OrgTier, OrgType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateOrganisationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(OrgType)
  type?: OrgType;

  @IsOptional()
  @IsEnum(OrgTier)
  tier?: OrgTier;

  @IsOptional()
  @IsEnum(OnboardingMode)
  onboardingMode?: OnboardingMode;

  @IsOptional()
  @IsString()
  dataResidency?: string;
}
