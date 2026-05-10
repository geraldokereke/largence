import { Injectable } from '@nestjs/common';
import { Matter, MatterPriority, MatterType, PracticeArea } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatterAutomationService {
  constructor(private prisma: PrismaService) {}

  async processNewMatter(matter: Matter) {
    const org = await this.prisma.organisation.findUnique({
      where: { id: matter.orgId },
    });

    if (
      org?.dataResidency === 'eu-west-2' &&
      matter.type === MatterType.TRANSACTION &&
      matter.practiceArea === PracticeArea.CORPORATE
    ) {
      await this.createCacChecklist(matter.id, matter.leadSolicitorId);
    }
  }

  private async createCacChecklist(matterId: string, creatorId: string) {
    const tasks = [
      'Reserve company name via CAC portal',
      'Collect directors IDs and signatures',
      'Prepare Memorandum and Articles of Association',
      'Payment of Stamp Duties (FIRS)',
      'Upload signed documents to CAC',
      'Payment of registration fees',
      'Respond to queries (if any)',
      'Download Certificate of Incorporation',
      'Obtain Certified True Copies (CTC)',
      'Apply for TIN (Tax Identification Number)',
      'Open Corporate Bank Account',
      'Initial Board Meeting minutes',
    ];

    await this.prisma.matterTask.createMany({
      data: tasks.map(title => ({
        matterId,
        title,
        status: 'TODO',
        priority: MatterPriority.HIGH,
        createdBy: creatorId,
      })),
    });
  }
}
