import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentPermission, DocumentStatus } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateDocumentDto {
  @ApiProperty({ example: 'Lease Agreement - Unit 4B' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'lease_agreement_v1.pdf' })
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @ApiProperty({ example: 1048576 })
  @IsInt()
  @Min(0)
  size!: number;

  @ApiProperty({ example: 'workspace-id-here' })
  @IsUUID()
  workspaceId!: string;

  @ApiPropertyOptional({ example: 'matter-id-here' })
  @IsUUID()
  @IsOptional()
  matterId?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isConfidential?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: any;
}

export class UpdateDocumentDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isConfidential?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: any;
}

export class StateTransitionDto {
  @ApiProperty({ enum: DocumentStatus })
  @IsEnum(DocumentStatus)
  status!: DocumentStatus;

  @ApiPropertyOptional({ example: 'Review completed by lead solicitor' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class GrantAccessDto {
  @ApiProperty()
  @IsUUID()
  userId!: string;

  @ApiProperty({ enum: DocumentPermission })
  @IsEnum(DocumentPermission)
  permission!: DocumentPermission;
}

export class DocumentResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  fileName!: string;

  @ApiProperty()
  mimeType!: string;

  @ApiProperty()
  size!: number;

  @ApiProperty({ enum: DocumentStatus })
  status!: DocumentStatus;

  @ApiProperty()
  isConfidential!: boolean;

  @ApiProperty()
  workspaceId!: string;

  @ApiPropertyOptional()
  matterId?: string;

  @ApiProperty()
  currentVersion!: number;

  @ApiProperty()
  createdBy!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
