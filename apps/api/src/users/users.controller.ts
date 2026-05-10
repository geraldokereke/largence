import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Returns public and private profile data for a specific user.',
  })
  @ApiResponse({ status: 200, description: 'User found.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getUser(@Param('id') id: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        roles: true,
        isActive: true,
        tier: true,
        createdAt: true,
      },
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile' })
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
    });
  }

  @Get(':id/preferences')
  @ApiOperation({
    summary: 'Get user preferences',
    description: 'Fetches custom user settings like notification status and UI themes.',
  })
  async getPreferences(@Param('id') id: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: { metadata: true },
    });
    return (user.metadata as Record<string, any>) || {};
  }

  @Patch(':id/preferences')
  @ApiOperation({ summary: 'Update user preferences' })
  async updatePreferences(@Param('id') id: string, @Body() prefs: any) {
    return this.prisma.user.update({
      where: { id },
      data: { metadata: prefs as Record<string, any> },
    });
  }
}
