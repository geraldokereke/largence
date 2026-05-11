import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, TemplateStatus, TemplateTier } from '@prisma/client';
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

  async create(dto: CreateTemplateDto, userId: string, orgId?: string) {
    return this.prisma.template.create({
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
  }

  async findAll(query: { tier?: TemplateTier; categoryId?: string; orgId?: string }) {
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

  async findOne(id: string) {
    const template = await this.prisma.template.findUnique({
      where: { id },
      include: { category: true, versions: { orderBy: { createdAt: 'desc' } } },
    });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async update(id: string, dto: UpdateTemplateDto) {
    // Logic to verify ownership/admin
    return this.prisma.template.update({
      where: { id },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
    });
  }

  async createVersion(
    templateId: string,
    dto: CreateTemplateVersionDto,
    file: Buffer,
    userId: string,
  ) {
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

  async instantiate(
    templateId: string,
    dto: InstantiateTemplateDto,
    userId: string,
    orgId: string,
  ) {
    const template = await this.findOne(templateId);
    const latestVersion = template.versions[0];

    if (!latestVersion) throw new BadRequestException('Template has no versions');

    // Logic for Template -> Document instantiation
    // In a real scenario, this would trigger the Generation Engine
    // For now, we create a Document pointing to the same file or a copy

    const newFileKey = `orgs/${orgId}/docs/instantiated_${templateId}_${Date.now()}.docx`;

    // Copy template file to document location
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

  async search(q: string) {
    // This should extend OpenSearch
    // Stub for now
    return this.prisma.template.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
    });
  }
}
