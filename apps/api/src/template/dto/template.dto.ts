import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TemplateStatus, TemplateTier } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateTemplateDto {
  @ApiProperty({ example: 'Employment Contract' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Standard employment agreement for new hires' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: TemplateTier })
  @IsEnum(TemplateTier)
  tier: TemplateTier;

  @ApiProperty({ example: 'uuid-of-category' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({ example: 'United Kingdom' })
  @IsString()
  @IsOptional()
  jurisdiction?: string;

  @ApiPropertyOptional({ example: ['HR', 'Employment', 'Standard'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ example: 49.99 })
  @IsNumber()
  @IsOptional()
  price?: number;
}

export class UpdateTemplateDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: TemplateTier })
  @IsEnum(TemplateTier)
  @IsOptional()
  tier?: TemplateTier;

  @ApiPropertyOptional({ enum: TemplateStatus })
  @IsEnum(TemplateStatus)
  @IsOptional()
  status?: TemplateStatus;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  jurisdiction?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  price?: number;
}

export class CreateTemplateVersionDto {
  @ApiProperty({ example: '1.1.0' })
  @IsString()
  @IsNotEmpty()
  version: string;

  @ApiPropertyOptional({ example: 'Added intellectual property clauses' })
  @IsString()
  @IsOptional()
  changeLog?: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: any;
}

export class InstantiateTemplateDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  workspaceId: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  matterId?: string;

  @ApiProperty({ example: { employee_name: 'John Doe', salary: 50000 } })
  @IsOptional()
  variables: Record<string, any>;
}
