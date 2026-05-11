import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  Prisma,
  Document as PrismaDocument,
  Template,
  TemplateStatus,
  TemplateTier,
  TemplateVersion,
} from '@prisma/client';
import * as semver from 'semver';
import { SearchService } from '../common/services/search.service';
import { StorageService } from '../common/services/storage.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTemplateDto,
  CreateTemplateVersionDto,
  InstantiateTemplateDto,
  UpdateTemplateDto,
} from './dto/template.dto';

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private searchService: SearchService,
  ) {}

  async create(dto: CreateTemplateDto, userId: string, orgId?: string): Promise<Template> {
    const template = await this.prisma.template.create({
      data: {
        title: dto.title,
        description: dto.description,
        tier: dto.tier,
        categoryId: dto.categoryId,
        orgId: dto.tier === TemplateTier.COMMUNITY ? null : orgId,
        price: dto.price,
        jurisdiction: dto.jurisdiction,
        tags: dto.tags || [],
        createdBy: userId,
      },
    });

    await this.searchService.indexTemplate(template);
    return template;
  }

  async createFromDocument(documentId: string, userId: string, orgId: string): Promise<Template> {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: { versions: { where: { isCurrent: true } } },
    });

    if (!document || !document.versions[0]) {
      throw new NotFoundException('Document or current version not found');
    }

    const currentVersion = document.versions[0];

    const metadata = (document.metadata as Prisma.JsonObject) || {};

    // Create the template
    const template = await this.prisma.template.create({
      data: {
        title: `Template from: ${document.title}`,
        description: `Automatically created from document ${document.id}`,
        tier: TemplateTier.CURATED, // Default to firm-curated
        orgId,
        categoryId: (metadata['categoryId'] as string) || 'default-category-uuid',
        jurisdiction: metadata['jurisdiction'] as string,
        tags: (metadata['tags'] as string[]) || [],
        createdBy: userId,
        status: TemplateStatus.DRAFT,
      },
    });

    // Copy the file
    const templateFileKey = `templates/${template.id}/v1.0.0_template.docx`;
    const documentFile = await this.storage.download(currentVersion.fileKey);
    await this.storage.upload(
      templateFileKey,
      documentFile,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );

    // Create template version
    await this.prisma.templateVersion.create({
      data: {
        templateId: template.id,
        version: '1.0.0',
        fileKey: templateFileKey,
        changeLog: 'Initial version from document capture',
        createdBy: userId,
      },
    });

    await this.prisma.template.update({
      where: { id: template.id },
      data: { currentVersion: '1.0.0' },
    });

    await this.searchService.indexTemplate(template);
    return template;
  }

  async findAll(query: {
    tier?: TemplateTier;
    categoryId?: string;
    orgId?: string;
  }): Promise<Template[]> {
    return this.prisma.template.findMany({
      where: {
        tier: query.tier,
        categoryId: query.categoryId,
        OR: [
          { orgId: query.orgId },
          { tier: TemplateTier.COMMUNITY },
          { tier: TemplateTier.PROFESSIONAL }, // Marketplace
        ],
        status: TemplateStatus.PUBLISHED,
      },
      include: { category: true },
    });
  }

  async findOne(id: string): Promise<Template & { versions: any[]; category: any }> {
    const template = await this.prisma.template.findUnique({
      where: { id },
      include: { category: true, versions: { orderBy: { createdAt: 'desc' } } },
    });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async update(id: string, dto: UpdateTemplateDto): Promise<Template> {
    const updated = await this.prisma.template.update({
      where: { id },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
    });
    await this.searchService.indexTemplate(updated);
    return updated;
  }

  async createVersion(
    templateId: string,
    dto: CreateTemplateVersionDto,
    file: Buffer,
    userId: string,
  ): Promise<any> {
    const template = await this.findOne(templateId);

    if (!semver.valid(dto.version)) {
      throw new BadRequestException('Invalid semver version');
    }

    if (template.currentVersion && !semver.gt(dto.version, template.currentVersion)) {
      throw new BadRequestException('New version must be greater than current version');
    }

    const fileKey = `templates/${templateId}/${dto.version}_template.docx`;
    await this.storage.upload(
      fileKey,
      file,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );

    const version = await this.prisma.templateVersion.create({
      data: {
        templateId,
        version: dto.version,
        fileKey,
        changeLog: dto.changeLog,
        metadata: (dto.metadata as Prisma.JsonObject) || {},
        createdBy: userId,
      },
    });

    await this.prisma.template.update({
      where: { id: templateId },
      data: { currentVersion: dto.version },
    });

    return version;
  }

  async submitForReview(id: string): Promise<any> {
    const updated = await this.prisma.template.update({
      where: { id },
      data: { status: TemplateStatus.PENDING_REVIEW },
    });
    await this.searchService.indexTemplate(updated);
    return updated;
  }

  async approveReview(id: string, reviewerId: string, comments?: string): Promise<any> {
    await this.prisma.templateReview.create({
      data: {
        templateId: id,
        reviewerId,
        status: TemplateStatus.PUBLISHED,
        comments,
      },
    });

    const updated = await this.prisma.template.update({
      where: { id },
      data: { status: TemplateStatus.PUBLISHED },
    });

    await this.searchService.indexTemplate(updated);
    return updated;
  }

  async rejectReview(id: string, reviewerId: string, comments: string): Promise<any> {
    await this.prisma.templateReview.create({
      data: {
        templateId: id,
        reviewerId,
        status: TemplateStatus.REJECTED,
        comments,
      },
    });

    const updated = await this.prisma.template.update({
      where: { id },
      data: { status: TemplateStatus.REJECTED },
    });

    await this.searchService.indexTemplate(updated);
    return updated;
  }

  async instantiate(
    templateId: string,
    dto: InstantiateTemplateDto,
    userId: string,
    orgId: string,
  ): Promise<PrismaDocument> {
    const template = await this.findOne(templateId);
    const latestVersion = template.versions[0] as TemplateVersion;

    if (!latestVersion) throw new BadRequestException('Template has no versions');

    const newFileKey = `orgs/${orgId}/docs/instantiated_${templateId}_${Date.now()}.docx`;

    const templateFile = await this.storage.download(latestVersion.fileKey);
    await this.storage.upload(
      newFileKey,
      templateFile,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );

    const document = await this.prisma.document.create({
      data: {
        title: `${template.title} - ${new Date().toLocaleDateString()}`,
        fileName: `instantiated_${templateId}.docx`,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: templateFile.length,
        orgId,
        workspaceId: dto.workspaceId,
        matterId: dto.matterId,
        createdBy: userId,
        metadata: {
          instantiatedFrom: templateId,
          version: latestVersion.version,
          variables: dto.variables,
        },
      },
    });

    await this.prisma.documentVersion.create({
      data: {
        documentId: document.id,
        versionNumber: 1,
        fileKey: newFileKey,
        size: templateFile.length,
        createdBy: userId,
        isCurrent: true,
      },
    });

    return document;
  }

  async search(q: string, orgId?: string): Promise<Template[]> {
    const results = await this.searchService.searchTemplates(q, orgId);
    return results as unknown as Template[];
  }
}
