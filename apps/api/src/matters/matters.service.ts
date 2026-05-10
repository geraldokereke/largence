import { Injectable, NotFoundException } from '@nestjs/common';
import { MatterPriority, MatterStatus, MatterType, PracticeArea, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictCheckService } from './conflict-check.service';
import { UpdateMatterDto } from './dto/matter.dto';
import { MatterAutomationService } from './matter-automation.service';

@Injectable()
export class MattersService {
  constructor(
    private prisma: PrismaService,
    private conflictCheck: ConflictCheckService,
    private automation: MatterAutomationService,
  ) {}

  async createMatter(data: {
    title: string;
    type: MatterType;
    practiceArea: PracticeArea;
    workspaceId: string;
    orgId: string;
    leadSolicitorId: string;
    counterparties?: Prisma.InputJsonValue;
    jurisdictions?: string[];
    priority?: MatterPriority;
    metadata?: Prisma.InputJsonValue;
  }) {
    // 1. Run Conflict of Interest Check
    const conflictResult = await this.conflictCheck.check(data.orgId, data.counterparties);

    // 2. Generate Reference (Simplified: LARG-YYYY-HASH)
    const year = new Date().getFullYear();
    const hash = Math.random().toString(36).substring(7).toUpperCase();
    const reference = `LARG-${year}-${hash}`;

    const matter = await this.prisma.matter.create({
      data: {
        title: data.title,
        type: data.type,
        practiceArea: data.practiceArea,
        workspaceId: data.workspaceId,
        orgId: data.orgId,
        leadSolicitorId: data.leadSolicitorId,
        reference,
        status: MatterStatus.OPEN,
        priority: data.priority || MatterPriority.MEDIUM,
        counterparties: data.counterparties,
        metadata: data.metadata,
        jurisdictions: data.jurisdictions || [],
      },
    });

    // 3. Trigger Automation (e.g., CAC Checklist)
    await this.automation.processNewMatter(matter);

    return {
      ...matter,
      conflictWarning: conflictResult.hasConflict,
      conflicts: conflictResult.conflicts,
    };
  }

  async getWorkspaceMatters(workspaceId: string) {
    return this.prisma.matter.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getMatterById(id: string) {
    const matter = await this.prisma.matter.findUnique({
      where: { id },
      include: {
        tasks: true,
        timeEntries: true,
      },
    });

    if (!matter) throw new NotFoundException('MATTER_NOT_FOUND');
    return matter;
  }

  async updateMatter(id: string, data: UpdateMatterDto) {
    return this.prisma.matter.update({
      where: { id },
      data,
    });
  }

  async closeMatter(id: string) {
    return this.prisma.matter.update({
      where: { id },
      data: {
        status: MatterStatus.CLOSED,
        closeDate: new Date(),
      },
    });
  }
}
