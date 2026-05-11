import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';

interface SearchFilters {
  orgId?: string;
  workspaceId?: string;
  matterId?: string;
}

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly client: Client;
  private readonly logger = new Logger(SearchService.name);
  private readonly index = 'documents';

  constructor() {
    this.client = new Client({
      node: process.env.OPENSEARCH_NODE || 'http://localhost:9200',
      auth: {
        username: process.env.OPENSEARCH_USERNAME || 'admin',
        password: process.env.OPENSEARCH_PASSWORD || 'admin',
      },
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  async onModuleInit() {
    await this.ensureIndex();
  }

  private async ensureIndex() {
    try {
      const exists = (await this.client.indices.exists({
        index: this.index,
      })) as { body: boolean };
      if (!exists.body) {
        await this.client.indices.create({
          index: this.index,
          body: {
            settings: {
              index: {
                number_of_shards: 1,
                number_of_replicas: 0,
              },
            },
            mappings: {
              properties: {
                id: { type: 'keyword' },
                title: { type: 'text', analyzer: 'english' },
                fileName: { type: 'text', analyzer: 'english' },
                content: { type: 'text', analyzer: 'english' },
                orgId: { type: 'keyword' },
                workspaceId: { type: 'keyword' },
                matterId: { type: 'keyword' },
                status: { type: 'keyword' },
                tags: { type: 'keyword' },
                createdAt: { type: 'date' },
              },
            },
          },
        });
        this.logger.log(`Created OpenSearch index: ${this.index}`);
      }
    } catch (error) {
      this.logger.error('Failed to ensure OpenSearch index exists', (error as Error).stack);
    }
  }

  async indexDocument(
    document: {
      id: string;
      title: string;
      fileName: string;
      orgId: string;
      workspaceId: string;
      matterId: string | null;
      status: string;
      tags?: string[];
      createdAt: Date;
    },
    content?: string,
  ) {
    try {
      await this.client.index({
        index: this.index,
        id: document.id,
        body: {
          id: document.id,
          title: document.title,
          fileName: document.fileName,
          content: content || '',
          orgId: document.orgId,
          workspaceId: document.workspaceId,
          matterId: document.matterId,
          status: document.status,
          tags: document.tags || [],
          createdAt: document.createdAt,
        },
        refresh: true,
      });
    } catch (error) {
      this.logger.error(`Failed to index document: ${document.id}`, (error as Error).stack);
    }
  }

  async search(query: string, filters: SearchFilters = {}) {
    const must: any[] = [
      {
        multi_match: {
          query,
          fields: ['title^3', 'fileName^2', 'content'],
          fuzziness: 'AUTO',
        },
      },
    ];

    if (filters.orgId) must.push({ term: { orgId: filters.orgId } });
    if (filters.workspaceId) must.push({ term: { workspaceId: filters.workspaceId } });
    if (filters.matterId) must.push({ term: { matterId: filters.matterId } });

    try {
      const result = (await this.client.search({
        index: this.index,
        body: {
          query: {
            bool: { must },
          },
        },
      })) as {
        body: { hits: { hits: Array<{ _source: Record<string, unknown> }> } };
      };
      return result.body.hits.hits.map(hit => hit._source);
    } catch (error) {
      this.logger.error('Search failed', (error as Error).stack);
      return [];
    }
  }

  async remove(id: string) {
    try {
      await this.client.delete({
        index: this.index,
        id,
      });
    } catch (error) {
      this.logger.error(`Failed to remove document from index: ${id}`, (error as Error).stack);
    }
  }
}
