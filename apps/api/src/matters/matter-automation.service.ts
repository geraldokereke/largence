import { Injectable } from '@nestjs/common';
import { Matter, MatterPriority, MatterType, PracticeArea } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatterAutomationService {
  constructor(private prisma: PrismaService) {}

  async processNewMatter(matter: Matter) {
    // 9. CAC Filing Checklist Trigger
    // Check if it's a Corporate Transaction in Nigeria (NG)
    if (
      matter.jurisdictions.includes('NG') &&
      matter.type === MatterType.TRANSACTION &&
      matter.practiceArea === PracticeArea.CORPORATE
    ) {
      await this.createCacChecklist(matter.id, matter.leadSolicitorId);
    }
  }

  private async createCacChecklist(matterId: string, creatorId: string) {
    const tasks = [
      'Conduct name availability search (CAC)',
      'Reserve company name (CAC portal)',
      'Prepare Memorandum and Articles of Association',
      'Obtain CAC Form CAC 1.1 (Application for Registration)',
      'Stamp duty payment on share capital',
      'Notarise founding documents',
      'File incorporation documents with CAC',
      'Pay CAC registration fees',
      'Obtain Certificate of Incorporation',
      'Register for Tax Identification Number (FIRS)',
      'Register for VAT (if applicable)',
      'Open corporate bank account',
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
