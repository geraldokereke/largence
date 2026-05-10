import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MatterPriority, MatterStatus, MatterType, PracticeArea } from '@prisma/client';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMatterDto {
  @ApiProperty({ example: 'Smith vs. Global Corp', description: 'The title of the legal matter' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ enum: MatterType, example: MatterType.LITIGATION })
  @IsEnum(MatterType)
  type!: MatterType;

  @ApiProperty({ enum: PracticeArea, example: PracticeArea.COMMERCIAL })
  @IsEnum(PracticeArea)
  practiceArea!: PracticeArea;

  @ApiProperty({
    example: 'uuid-of-workspace',
    description: 'The ID of the workspace this matter belongs to',
  })
  @IsString()
  @IsNotEmpty()
  workspaceId!: string;

  @ApiPropertyOptional({ enum: MatterPriority, default: MatterPriority.MEDIUM })
  @IsOptional()
  @IsEnum(MatterPriority)
  priority?: MatterPriority;

  @ApiPropertyOptional({
    example: [{ name: 'Global Corp', role: 'DEFENDANT' }],
    description: 'List of counterparties for conflict checking',
  })
  @IsOptional()
  @IsArray()
  counterparties?: any[];

  @ApiPropertyOptional({ example: ['NG', 'UK'], description: 'Jurisdictions involved' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  jurisdictions?: string[];

  @ApiPropertyOptional({
    example: { courtCode: 'HC/123' },
    description: 'Additional custom metadata',
  })
  @IsOptional()
  metadata?: any;
}

export class UpdateMatterDto {
  @ApiPropertyOptional({ example: 'New Title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ enum: MatterStatus })
  @IsOptional()
  @IsEnum(MatterStatus)
  status?: MatterStatus;

  @ApiPropertyOptional({ enum: MatterPriority })
  @IsOptional()
  @IsEnum(MatterPriority)
  priority?: MatterPriority;
}
