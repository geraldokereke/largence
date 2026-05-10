import { Injectable } from '@nestjs/common';
import { TimeEntry } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async getMatterWip(matterId: string) {
    const entries = await this.prisma.timeEntry.findMany({
      where: { matterId, billed: false },
    });

    // Group by currency and calculate totals
    const wip = entries.reduce(
      (acc: Record<string, number>, curr: TimeEntry) => {
        const currency = curr.currency;
        const amount = Number(curr.hours) * Number(curr.rate);

        if (!acc[currency]) acc[currency] = 0;
        acc[currency] += amount;

        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      matterId,
      totalWip: wip,
      entryCount: entries.length,
    };
  }

  async logTime(data: {
    matterId: string;
    userId: string;
    description: string;
    hours: number;
    rate: number;
    currency: string;
  }) {
    return this.prisma.timeEntry.create({
      data: {
        ...data,
        date: new Date(),
      },
    });
  }
}
