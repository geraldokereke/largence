import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface Counterparty {
  name: string;
  role?: string;
  [key: string]: unknown;
}

@Injectable()
export class ConflictCheckService {
  constructor(private prisma: PrismaService) {}

  async check(orgId: string, counterparties: unknown) {
    if (!counterparties || !Array.isArray(counterparties)) {
      return { hasConflict: false, conflicts: [] };
    }

    const castedCounterparties = counterparties as Counterparty[];
    // This is a simplified check. In production, this would use Elasticsearch
    // to search across the 'counterparties' Json field in the Matter table.
    // For now, we'll do a basic search for name matches if they exist
    const names = castedCounterparties.map(cp => cp.name).filter(Boolean);
    if (names.length === 0) return { hasConflict: false, conflicts: [] };

    // Find other matters in the same org that mention these counterparties
    // Note: This is an expensive query in Prisma without Full Text Search
    const conflicts = await this.prisma.matter.findMany({
      where: {
        orgId,
        status: { in: ['OPEN', 'ACTIVE', 'PENDING'] },
        OR: names.map(name => ({
          counterparties: {
            path: ['$'],
            array_contains: { name },
          },
        })),
      },
      select: { id: true, title: true, reference: true },
    });

    return {
      hasConflict: conflicts.length > 0,
      conflicts,
    };
  }
}
