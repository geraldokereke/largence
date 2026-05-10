import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Organisation, Role, User } from '@prisma/client';
import { CurrentOrg } from '../common/decorators/current-org.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { AcceptInviteDto, InviteUserDto } from './dto/invite.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { InvitesService } from './invites.service';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth/invites')
export class InvitesController {
  constructor(private invitesService: InvitesService) {}

  @Post()
  @Roles(Role.ORG_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createInvite(
    @Body() dto: InviteUserDto,
    @CurrentOrg() org: Organisation,
    @CurrentUser() user: User,
  ) {
    return this.invitesService.createInvite(dto, org.id, user.id);
  }

  @Public()
  @Get(':token')
  async getInvite(@Param('token') token: string) {
    return this.invitesService.getInviteByToken(token);
  }

  @Public()
  @Post(':token/accept')
  async acceptInvite(@Param('token') token: string, @Body() dto: AcceptInviteDto) {
    return this.invitesService.acceptInvite(token, dto);
  }
}
