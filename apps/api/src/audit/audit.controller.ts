import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CryptoService } from '../auth/crypto.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('audit')
@ApiBearerAuth()
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(
    private prisma: PrismaService,
    private crypto: CryptoService,
  ) {}

  @Get('events')
  @Roles(Role.PLATFORM_ADMIN)
  @ApiOperation({
    summary: 'List global audit events',
    description: 'Restricted to platform administrators. Shows events across all organisations.',
  })
  async getGlobalEvents() {
    return this.prisma.auditEvent.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('events/:id')
  @Roles(Role.ORG_ADMIN, Role.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'Get audit event details' })
  async getEventDetail(@Param('id') id: string) {
    return this.prisma.auditEvent.findUniqueOrThrow({
      where: { id },
    });
  }

  @Get('organisations/:orgId/events')
  @Roles(Role.ORG_ADMIN, Role.PLATFORM_ADMIN)
  @ApiOperation({ summary: 'List organisation-specific audit events' })
  async getOrganisationEvents(@Param('orgId') orgId: string) {
    return this.prisma.auditEvent.findMany({
      where: { orgId },
      take: 100,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('resources/:type/:id/events')
  @Roles(Role.ORG_ADMIN, Role.FEE_EARNER)
  @ApiOperation({ summary: 'List events for a specific resource (Matter, Workspace, etc.)' })
  async getResourceEvents(@Param('type') type: string, @Param('id') id: string) {
    return this.prisma.auditEvent.findMany({
      where: {
        metadata: {
          path: ['resourceId'],
          equals: id,
        },
      },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('certificates/generate')
  @Roles(Role.ORG_ADMIN)
  @ApiOperation({
    summary: 'Generate a signed audit certificate',
    description:
      'Creates a cryptographically hashed proof of a sequence of events for regulatory compliance.',
  })
  async generateAuditCertificate(
    @Body() body: { orgId: string; startTime: string; endTime: string },
  ) {
    const events = await this.prisma.auditEvent.findMany({
      where: {
        orgId: body.orgId,
        createdAt: {
          gte: new Date(body.startTime),
          lte: new Date(body.endTime),
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const org = await this.prisma.organisation.findUniqueOrThrow({ where: { id: body.orgId } });

    const eventString = events.map(e => `${e.id}:${e.createdAt.getTime()}:${e.action}`).join('|');
    const fingerprint = this.crypto.hashSha256(eventString);

    const certificate = await this.prisma.auditCertificate.create({
      data: {
        orgId: body.orgId,
        orgSlug: org.slug,
        generatedBy: 'SYSTEM',
        eventCount: events.length,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        fingerprint,
      },
    });

    return certificate;
  }

  @Get('export')
  @Roles(Role.ORG_ADMIN)
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="audit_log.csv"')
  @ApiOperation({
    summary: 'Export audit logs to CSV',
    description: 'Generates a downloadable CSV file of all events for an organisation.',
  })
  async exportAuditLog(@Query('orgId') orgId: string) {
    const events = await this.prisma.auditEvent.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });

    const header = 'ID,Timestamp,Action,User,Result\n';
    const rows = events
      .map(
        e => `${e.id},${e.createdAt.toISOString()},${e.action},${e.userId || 'system'},${e.result}`,
      )
      .join('\n');

    return new StreamableFile(Buffer.from(header + rows));
  }
}
