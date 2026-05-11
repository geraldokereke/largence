import { Injectable } from '@nestjs/common';
import { SearchService } from '../common/services/search.service';

export interface Counterparty {
  name: string;
  role?: string;
  [key: string]: unknown;
}

@Injectable()
export class ConflictCheckService {
  constructor(private searchService: SearchService) {}

  async check(orgId: string, counterparties: unknown) {
    if (!counterparties || !Array.isArray(counterparties)) {
      return { hasConflict: false, conflicts: [] };
    }

    const castedCounterparties = counterparties as Counterparty[];
    const names = castedCounterparties.map(cp => cp.name).filter(Boolean);
    if (names.length === 0) return { hasConflict: false, conflicts: [] };

    const query = names.join(' ');

    // Use OpenSearch for robust conflict check across all matter counterparties
    const conflicts = await this.searchService.searchMatters(query, orgId);

    interface MatterHit {
      id: string;
      title: string;
      reference: string;
    }

    return {
      hasConflict: conflicts.length > 0,
      conflicts: (conflicts as unknown as MatterHit[]).map(c => ({
        id: c.id,
        title: c.title,
        reference: c.reference,
      })),
    };
  }
}
