import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CheckTier } from '../common/decorators/check-tier.decorator';
import { TierGuard } from '../common/guards/tier.guard';
import { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { AddWorkspaceMemberDto, CreateWorkspaceDto } from './dto/workspace.dto';
import { WorkspacesService } from './workspaces.service';

@ApiTags('workspaces')
@ApiBearerAuth()
@Controller('workspaces')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkspacesController {
  constructor(private workspacesService: WorkspacesService) {}

  @Post()
  @Roles(Role.ORG_ADMIN, Role.PARTNER)
  @UseGuards(TierGuard)
  @CheckTier('activeWorkspaces')
  @ApiOperation({
    summary: 'Create a new workspace',
    description: 'Creates a department-level isolation unit for matters.',
  })
  @ApiResponse({ status: 201, description: 'Workspace successfully created.' })
  async createWorkspace(@Request() req: AuthenticatedRequest, @Body() dto: CreateWorkspaceDto) {
    return this.workspacesService.createWorkspace({
      ...dto,
      orgId: req.user.orgId,
      createdBy: req.user.id,
    });
  }

  @Get()
  @ApiOperation({ summary: 'List all workspaces in organisation' })
  async getWorkspaces(@Request() req: AuthenticatedRequest) {
    return this.workspacesService.getOrgWorkspaces(req.user.orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workspace details' })
  async getWorkspace(@Param('id') id: string) {
    return this.workspacesService.getWorkspaceById(id);
  }

  @Post(':id/members')
  @Roles(Role.ORG_ADMIN, Role.WORKSPACE_ADMIN)
  @ApiOperation({
    summary: 'Add a user to a workspace',
    description: 'Assigns a specific role to a user within the workspace.',
  })
  async addMember(
    @Param('id') id: string,
    @Body() dto: AddWorkspaceMemberDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.workspacesService.addMember(id, dto.userId, dto.role, req.user.id);
  }

  @Delete(':id/members/:userId')
  @Roles(Role.ORG_ADMIN, Role.WORKSPACE_ADMIN)
  @ApiOperation({ summary: 'Remove a user from a workspace' })
  async removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.workspacesService.removeMember(id, userId);
  }
}
