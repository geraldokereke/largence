import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CheckTier } from '../common/decorators/check-tier.decorator';
import { TierGuard } from '../common/guards/tier.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { BillingService } from './billing.service';
import { CreateMatterDto, UpdateMatterDto } from './dto/matter.dto';
import { MattersService } from './matters.service';

@ApiTags('matters')
@ApiBearerAuth()
@Controller('matters')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MattersController {
  constructor(
    private mattersService: MattersService,
    private billingService: BillingService,
  ) {}

  @Post()
  @Roles(Role.ORG_ADMIN, Role.PARTNER, Role.FEE_EARNER)
  @UseGuards(TierGuard, WorkspaceGuard)
  @CheckTier('activeMatters')
  @ApiOperation({
    summary: 'Create a new legal matter',
    description: 'Initializes a case with automated conflict checks and regulatory triggers.',
  })
  @ApiResponse({ status: 201, description: 'Matter successfully created.' })
  async createMatter(@Request() req: AuthenticatedRequest, @Body() dto: CreateMatterDto) {
    return this.mattersService.createMatter({
      ...dto,
      orgId: req.user.orgId,
      leadSolicitorId: req.user.id,
    });
  }

  @Get('workspace/:workspaceId')
  @UseGuards(WorkspaceGuard)
  @ApiOperation({ summary: 'List all matters in a workspace' })
  async getMatters(
    @Param('workspaceId') workspaceId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<any[]> {
    return this.mattersService.getWorkspaceMatters(workspaceId, req.user.id, req.user.roles);
  }

  @Get(':id')
  @UseGuards(WorkspaceGuard)
  @ApiOperation({
    summary: 'Get detailed matter information',
    description: 'Includes tasks, time entries, and financial overview.',
  })
  async getMatter(@Param('id') id: string): Promise<any> {
    return this.mattersService.getMatterById(id);
  }

  @Patch(':id')
  @UseGuards(WorkspaceGuard)
  @ApiOperation({ summary: 'Update matter details' })
  async updateMatter(@Param('id') id: string, @Body() dto: UpdateMatterDto): Promise<any> {
    return this.mattersService.updateMatter(id, dto);
  }

  @Post(':id/close')
  @Roles(Role.ORG_ADMIN, Role.PARTNER)
  @UseGuards(WorkspaceGuard)
  @ApiOperation({
    summary: 'Close a legal matter',
    description: 'Finalizes the case and records the closing date.',
  })
  async closeMatter(@Param('id') id: string): Promise<any> {
    return this.mattersService.closeMatter(id);
  }

  @Get(':id/timeline')
  @UseGuards(WorkspaceGuard)
  @ApiOperation({ summary: 'Get matter activity timeline' })
  async getTimeline(): Promise<{ events: any[] }> {
    return Promise.resolve({ events: [] });
  }

  @Post(':id/time-entries')
  @Roles(Role.ORG_ADMIN, Role.FEE_EARNER)
  @UseGuards(TierGuard, WorkspaceGuard)
  @CheckTier('billing')
  @ApiOperation({
    summary: 'Log billable time',
    description: 'Records time spent on a matter for WIP and invoicing.',
  })
  async logTime(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() dto: { description: string; hours: number; rate: number; currency: string },
  ) {
    return this.billingService.logTime({
      ...dto,
      matterId: id,
      userId: req.user.id,
    });
  }

  @Get(':id/billing')
  @Roles(Role.ORG_ADMIN, Role.PARTNER)
  @UseGuards(TierGuard, WorkspaceGuard)
  @CheckTier('billing')
  @ApiOperation({
    summary: 'Get matter billing overview',
    description: 'Calculates total WIP across all currencies.',
  })
  async getBilling(@Param('id') id: string) {
    return this.billingService.getMatterWip(id);
  }
}
