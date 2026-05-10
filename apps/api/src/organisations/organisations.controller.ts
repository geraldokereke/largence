import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthService } from '../auth/auth.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { InvitesService } from '../auth/invites.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateOrganisationDto } from './dto/update-org.dto';

@ApiTags('organisations')
@ApiBearerAuth()
@Controller('organisations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganisationsController {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
    private invitesService: InvitesService,
  ) {}

  @Get(':id')
  @Roles(Role.ORG_ADMIN, Role.PLATFORM_ADMIN)
  async getOrganisation(@Param('id') id: string) {
    return this.prisma.organisation.findUniqueOrThrow({
      where: { id },
      include: {
        _count: { select: { users: true } },
      },
    });
  }

  @Patch(':id')
  @Roles(Role.ORG_ADMIN)
  async updateOrganisation(@Param('id') id: string, @Body() dto: UpdateOrganisationDto) {
    return this.prisma.organisation.update({
      where: { id },
      data: dto,
    });
  }

  @Get(':id/members')
  @Roles(Role.ORG_ADMIN, Role.FEE_EARNER)
  async getMembers(@Param('id') id: string) {
    return this.prisma.user.findMany({
      where: { orgId: id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        roles: true,
        isActive: true,
        lastLoginAt: true,
      },
    });
  }

  @Post(':id/members/invite')
  @Roles(Role.ORG_ADMIN)
  async inviteMember(@Param('id') id: string, @Body() dto: { email: string; role: Role }) {
    return this.invitesService.createInvite(
      { email: dto.email, role: dto.role },
      id,
      'SYSTEM', 
    );
  }

  @Delete(':id/members/:userId')
  @Roles(Role.ORG_ADMIN)
  async removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.prisma.user.update({
      where: { id: userId, orgId: id },
      data: { isActive: false },
    });
  }

  @Patch(':id/members/:userId/role')
  @Roles(Role.ORG_ADMIN)
  async updateMemberRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body('roles') roles: Role[],
  ) {
    return this.prisma.user.update({
      where: { id: userId, orgId: id },
      data: { roles },
    });
  }
}
