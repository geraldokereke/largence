import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorkspaceType, WorkspaceMemberRole } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateWorkspaceDto {
  @ApiProperty({ example: 'Litigation Department', description: 'The display name of the workspace' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: WorkspaceType, example: WorkspaceType.LITIGATION })
  @IsEnum(WorkspaceType)
  type!: WorkspaceType;

  @ApiPropertyOptional({ example: 'uuid-of-department', description: 'Optional department parent' })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({ example: { jurisdiction: 'Nigeria' }, description: 'Specific rules for this workspace' })
  @IsOptional()
  jurisdictionProfile?: any;
}

export class AddWorkspaceMemberDto {
  @ApiProperty({ example: 'uuid-of-user' })
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ enum: WorkspaceMemberRole, example: WorkspaceMemberRole.WORKSPACE_ADMIN })
  @IsEnum(WorkspaceMemberRole)
  role!: WorkspaceMemberRole;
}
