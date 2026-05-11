import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DocumentRetentionAction, DocumentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RetentionService {
  private readonly logger = new Logger(RetentionService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleRetention() {
    this.logger.log('Starting document retention policy check...');

    const now = new Date();

    // 1. Handle Auto-Archiving
    const archivedCount = await this.prisma.document.updateMany({
      where: {
        retentionDate: { lte: now },
        retentionAction: DocumentRetentionAction.ARCHIVE,
        status: { not: DocumentStatus.ARCHIVED },
      },
      data: {
        status: DocumentStatus.ARCHIVED,
      },
    });

    if (archivedCount.count > 0) {
      this.logger.log(`Auto-archived ${archivedCount.count} documents due to retention policy.`);
    }

    // 2. Handle Auto-Deletion
    // Note: For legal safety, we might want to ARCHIVE first then DELETE after a grace period.
    // But here we implement the direct deletion as requested by policy.
    const deletedCount = await this.prisma.document.deleteMany({
      where: {
        retentionDate: { lte: now },
        retentionAction: DocumentRetentionAction.DELETE,
      },
    });

    if (deletedCount.count > 0) {
      this.logger.warn(`Auto-deleted ${deletedCount.count} documents due to retention policy.`);
    }

    this.logger.log('Retention policy check completed.');
  }

  /**
   * Helper to set default retention (7 years)
   */
  static getDefaultRetentionDate(): Date {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 7);
    return date;
  }
}
