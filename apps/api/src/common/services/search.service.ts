import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { Template } from '@prisma/client';

interface SearchFilters {
  orgId?: string;
  workspaceId?: string;
  matterId?: string;
}

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly client: Client;
  private readonly logger = new Logger(SearchService.name);
  private readonly indices = ['documents', 'templates'];

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
    await this.ensureIndices();
  }

  private async ensureIndices() {
    for (const index of this.indices) {
      try {
        const exists = (await this.client.indices.exists({ index })) as { body: boolean };
        if (!exists.body) {
          const properties =
            index === 'documents'
              ? {
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
                }
              : {
                  id: { type: 'keyword' },
                  title: { type: 'text', analyzer: 'english' },
                  description: { type: 'text', analyzer: 'english' },
                  tier: { type: 'keyword' },
                  status: { type: 'keyword' },
                  jurisdiction: { type: 'keyword' },
                  tags: { type: 'keyword' },
                  orgId: { type: 'keyword' },
                  createdAt: { type: 'date' },
                };

          await this.client.indices.create({
            index,
            body: {
              settings: {
                index: { number_of_shards: 1, number_of_replicas: 0 },
              },
              mappings: { properties: properties as Record<string, any> },
            },
          });
          this.logger.log(`Created OpenSearch index: ${index}`);
        }
      } catch (error) {
        this.logger.error(
          `Failed to ensure OpenSearch index ${index} exists`,
          (error as Error).stack,
        );
      }
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
        index: 'documents',
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

  async indexTemplate(template: Template) {
    try {
      await this.client.index({
        index: 'templates',
        id: template.id,
        body: {
          id: template.id,
          title: template.title,
          description: template.description,
          tier: template.tier,
          status: template.status,
          jurisdictions: template.jurisdictions,
          practiceArea: template.practiceArea,
          linkedStatutes: template.linkedStatutes,
          tags: template.tags || [],
          orgId: template.orgId,
          createdAt: template.createdAt,
        },
        refresh: true,
      });
    } catch (error) {
      this.logger.error(`Failed to index template: ${template.id}`, (error as Error).stack);
    }
  }

  async searchTemplates(query: string, orgId?: string): Promise<Record<string, any>[]> {
    const must: any[] = [
      {
        multi_match: {
          query,
          fields: ['title^3', 'description^2'],
          fuzziness: 'AUTO',
        },
      },
    ];

    if (orgId) {
      must.push({
        bool: {
          should: [
            { term: { orgId } },
            { term: { tier: 'PROFESSIONAL' } },
            { term: { tier: 'COMMUNITY' } },
          ],
        },
      });
    }

    try {
      const result = await this.client.search({
        index: 'templates',
        body: { query: { bool: { must } } },
      });
      const body = result.body as { hits: { hits: Array<{ _source: Record<string, any> }> } };
      return body.hits.hits.map(hit => hit._source);
    } catch (error) {
      this.logger.error('Template search failed', (error as Error).stack);
      return [];
    }
  }

  async search(query: string, filters: SearchFilters = {}): Promise<Record<string, any>[]> {
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
      const result = await this.client.search({
        index: 'documents',
        body: {
          query: {
            bool: { must },
          },
        },
      });
      const body = result.body as { hits: { hits: Array<{ _source: Record<string, any> }> } };
      return body.hits.hits.map(hit => hit._source);
    } catch (error) {
      this.logger.error('Search failed', (error as Error).stack);
      return [];
    }
  }

  async remove(id: string) {
    try {
      await this.client.delete({
        index: 'documents',
        id,
      });
    } catch (error) {
      this.logger.error(`Failed to remove document from index: ${id}`, (error as Error).stack);
    }
  }
}
