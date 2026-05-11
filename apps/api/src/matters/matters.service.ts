import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DocumentStatus,
  MatterPriority,
  MatterStatus,
  MatterType,
  PracticeArea,
  Prisma,
  TaskStatus,
} from '@prisma/client';
import { SearchService } from '../common/services/search.service';
import { TierService } from '../common/services/tier.service';
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
    private tierService: TierService,
    private searchService: SearchService,
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
    // 13. Feature Gate: Check Tier Limits
    const org = await this.prisma.organisation.findUnique({
      where: { id: data.orgId },
    });
    if (!org) throw new NotFoundException('ORGANISATION_NOT_FOUND');

    const canCreate = await this.tierService.canCreateActiveMatters(org.id, org.tier);
    if (!canCreate) {
      throw new ForbiddenException({
        message: 'MATTER_LIMIT_REACHED',
        upgradeUrl: '/settings/billing/plans',
      });
    }

    // 8. Run Conflict of Interest Check (OpenSearch)
    const conflictResult = await this.conflictCheck.check(data.orgId, data.counterparties);

    // 5. Generate Reference (LARG-YYYY-XXXXX)
    const reference = await this.generateReference();

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

    // 16. Index in OpenSearch
    await this.searchService.indexMatter(matter);

    // 9. Trigger Automation (e.g., CAC Checklist)
    await this.automation.processNewMatter(matter);

    return {
      ...matter,
      conflictWarning: conflictResult.hasConflict,
      conflicts: conflictResult.conflicts,
    };
  }

  async updateMatter(id: string, data: UpdateMatterDto) {
    const current = await this.prisma.matter.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('MATTER_NOT_FOUND');

    // 6. Status State Machine Enforcement
    if (data.status && data.status !== current.status) {
      this.validateStatusTransition(current.status, data.status);
    }

    const updated = await this.prisma.matter.update({
      where: { id },
      data,
    });

    await this.searchService.indexMatter(updated);
    return updated;
  }

  async closeMatter(id: string) {
    const matter = await this.prisma.matter.findUnique({
      where: { id },
      include: {
        tasks: { where: { status: { not: TaskStatus.DONE } } },
        documents: {
          where: {
            status: {
              in: [
                DocumentStatus.DRAFT,
                DocumentStatus.UNDER_REVIEW,
                DocumentStatus.PENDING_SIGNATURE,
              ],
            },
          },
        },
        timeEntries: { where: { billed: false } },
      },
    });

    if (!matter) throw new NotFoundException('MATTER_NOT_FOUND');

    // 7. Structured Closure Workflow Guards
    if (matter.tasks.length > 0) {
      throw new BadRequestException('Cannot close matter with outstanding tasks');
    }
    if (matter.documents.length > 0) {
      throw new BadRequestException('Cannot close matter with unsigned documents');
    }
    if (matter.timeEntries.length > 0) {
      throw new BadRequestException('Cannot close matter with unbilled time entries');
    }

    const updated = await this.prisma.matter.update({
      where: { id },
      data: {
        status: MatterStatus.CLOSED,
        closeDate: new Date(),
      },
    });

    await this.searchService.indexMatter(updated);
    return updated;
  }

  private async generateReference(): Promise<string> {
    const year = new Date().getFullYear();

    // Atomic increment of the counter for the current year
    const counter = await this.prisma.matterCounter.upsert({
      where: { year },
      update: { count: { increment: 1 } },
      create: { year, count: 1 },
    });

    const sequence = counter.count.toString().padStart(5, '0');
    return `LARG-${year}-${sequence}`;
  }

  private validateStatusTransition(current: MatterStatus, next: MatterStatus) {
    const validTransitions: Record<MatterStatus, MatterStatus[]> = {
      [MatterStatus.ENQUIRY]: [MatterStatus.OPEN, MatterStatus.CLOSED],
      [MatterStatus.OPEN]: [MatterStatus.ACTIVE, MatterStatus.ON_HOLD, MatterStatus.CLOSED],
      [MatterStatus.ACTIVE]: [MatterStatus.PENDING, MatterStatus.ON_HOLD, MatterStatus.CLOSED],
      [MatterStatus.PENDING]: [MatterStatus.ACTIVE, MatterStatus.CLOSED],
      [MatterStatus.ON_HOLD]: [MatterStatus.ACTIVE, MatterStatus.CLOSED],
      [MatterStatus.CLOSED]: [MatterStatus.OPEN, MatterStatus.ARCHIVED],
      [MatterStatus.ARCHIVED]: [], // Final state
    };

    if (!validTransitions[current].includes(next)) {
      throw new BadRequestException(`Invalid status transition from ${current} to ${next}`);
    }
  }

  async getWorkspaceMatters(workspaceId: string, userId: string, roles: string[]) {
    return this.prisma.matter.findMany({
      where: {
        workspaceId,
        OR: [
          { confidential: false },
          { leadSolicitorId: userId },
          { allowedUsers: { has: userId } },
          { orgId: { in: roles.includes('ORG_ADMIN') ? undefined : [] } }, // Org admins see all
        ],
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getMatterById(id: string) {
    const matter = await this.prisma.matter.findUnique({
      where: { id },
      include: {
        tasks: true,
        timeEntries: true,
        documents: true,
      },
    });

    if (!matter) throw new NotFoundException('MATTER_NOT_FOUND');
    return matter;
  }
}
