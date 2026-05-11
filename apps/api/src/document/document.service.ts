import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Document, DocumentAction, DocumentStatus, DocumentVersion, Prisma } from '@prisma/client';
import { diffWordsWithSpace } from 'diff';
import { OcrService } from '../common/services/ocr.service';
import { SearchService } from '../common/services/search.service';
import { StorageService } from '../common/services/storage.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateDocumentDto,
  GrantAccessDto,
  StateTransitionDto,
  UpdateDocumentDto,
} from './dto/document.dto';
import { RetentionService } from './retention.service';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private searchService: SearchService,
    private ocr: OcrService,
  ) {}

  async diff(id: string, v1Number: number, v2Number: number) {
    const [v1, v2] = await Promise.all([
      this.prisma.documentVersion.findUnique({
        where: { documentId_versionNumber: { documentId: id, versionNumber: Number(v1Number) } },
      }),
      this.prisma.documentVersion.findUnique({
        where: { documentId_versionNumber: { documentId: id, versionNumber: Number(v2Number) } },
      }),
    ]);

    if (!v1 || !v2) throw new NotFoundException('One or both versions not found');

    const meta1 = v1.metadata as Prisma.JsonObject;
    const meta2 = v2.metadata as Prisma.JsonObject;

    const text1 = (meta1?.extractedText as string) || '';
    const text2 = (meta2?.extractedText as string) || '';

    if (!text1 && !text2) {
      throw new BadRequestException(
        'No text available for diffing (OCR might have failed or still running)',
      );
    }

    return diffWordsWithSpace(text1, text2);
  }

  async create(dto: CreateDocumentDto, userId: string, orgId: string) {
    const document = await this.prisma.document.create({
      data: {
        title: dto.title,
        fileName: dto.fileName,
        mimeType: dto.mimeType,
        size: dto.size,
        workspaceId: dto.workspaceId,
        matterId: dto.matterId,
        orgId: orgId,
        isConfidential: dto.isConfidential || false,
        createdBy: userId,
        metadata: dto.metadata as Prisma.InputJsonValue,
        retentionDate: RetentionService.getDefaultRetentionDate(),
      },
    });

    await this.logAudit(document.id, userId, DocumentAction.CREATE);
    return document;
  }

  async uploadVersion(
    documentId: string,
    file: Buffer,
    fileName: string,
    userId: string,
    changeLog?: string,
  ) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) throw new NotFoundException('Document not found');

    const versionNumber = document.currentVersion + 1;
    const fileKey = `orgs/${document.orgId}/docs/${document.id}/v${versionNumber}_${fileName}`;

    await this.storage.upload(fileKey, file, document.mimeType);

    const version = await this.prisma.documentVersion.create({
      data: {
        documentId,
        versionNumber,
        fileKey,
        size: file.length,
        changeLog,
        createdBy: userId,
        isCurrent: true,
      },
    });

    // Update parent document with latest metadata
    const updatedDocument = await this.prisma.document.update({
      where: { id: documentId },
      data: {
        currentVersion: versionNumber,
        title: fileName, // Auto-update title to match latest file
        fileName,
      },
    });

    await this.prisma.documentVersion.updateMany({
      where: { documentId, versionNumber: { lt: versionNumber } },
      data: { isCurrent: false },
    });

    // 5. Async OCR & Search Indexing (background)
    void this.processIntelligence(updatedDocument, version, file);

    await this.logAudit(documentId, userId, DocumentAction.VERSION_CREATE, {
      versionNumber,
      fileName,
    });

    return version;
  }

  async restoreVersion(id: string, versionNumber: number, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: { versions: true },
    });

    if (!document) throw new NotFoundException('Document not found');

    const targetVersion = document.versions.find(v => v.versionNumber === Number(versionNumber));
    if (!targetVersion) throw new NotFoundException(`Version ${versionNumber} not found`);

    const newVersionNumber = document.currentVersion + 1;

    // Create a NEW version that points to the OLD fileKey
    const restoredVersion = await this.prisma.documentVersion.create({
      data: {
        documentId: id,
        versionNumber: newVersionNumber,
        fileKey: targetVersion.fileKey,
        size: targetVersion.size,
        changeLog: `Restored from version ${versionNumber}`,
        createdBy: userId,
        isCurrent: true,
      },
    });

    // Update parent
    await this.prisma.document.update({
      where: { id },
      data: { currentVersion: newVersionNumber },
    });

    // Unset current on others
    await this.prisma.documentVersion.updateMany({
      where: { documentId: id, versionNumber: { lt: newVersionNumber } },
      data: { isCurrent: false },
    });

    await this.logAudit(id, userId, DocumentAction.VERSION_CREATE, {
      restoredFrom: versionNumber,
      newVersion: newVersionNumber,
    });

    return restoredVersion;
  }

  async bulkUpload(
    files: Express.Multer.File[],
    workspaceId: string,
    userId: string,
    orgId: string,
    matterId?: string,
  ) {
    const results = [];

    for (const file of files) {
      try {
        // 1. Create Document Metadata
        const document = await this.prisma.document.create({
          data: {
            title: file.originalname,
            fileName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            workspaceId,
            matterId,
            orgId,
            createdBy: userId,
            retentionDate: RetentionService.getDefaultRetentionDate(),
          },
        });

        // 2. Upload and Create Version (v1)
        const fileKey = `orgs/${orgId}/docs/${document.id}/v1_${file.originalname}`;
        await this.storage.upload(fileKey, file.buffer, file.mimetype);

        const version = await this.prisma.documentVersion.create({
          data: {
            documentId: document.id,
            versionNumber: 1,
            fileKey,
            size: file.size,
            createdBy: userId,
            isCurrent: true,
          },
        });

        // 3. Trigger Intelligence
        void this.processIntelligence(document, version, file.buffer);

        await this.logAudit(document.id, userId, DocumentAction.CREATE);
        results.push({ id: document.id, fileName: file.originalname, success: true });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`Bulk upload failed for ${file.originalname}: ${errorMessage}`);
        results.push({ fileName: file.originalname, success: false, error: errorMessage });
      }
    }

    return results;
  }

  private async processIntelligence(document: Document, version: DocumentVersion, file: Buffer) {
    try {
      this.logger.debug(
        `Starting intelligence processing for ${document.id} (Size: ${file.length} bytes)`,
      );

      // 1. Attempt OCR (Optional)
      let text = '';
      try {
        text = await this.ocr.extractText(
          process.env.AWS_S3_BUCKET || 'largence-documents',
          version.fileKey,
        );
      } catch (ocrError) {
        const errorMessage = ocrError instanceof Error ? ocrError.message : String(ocrError);
        this.logger.warn(
          `OCR failed for ${document.id}: ${errorMessage}. Proceeding with metadata indexing.`,
        );
      }

      // 2. Always index in OpenSearch (Metadata + whatever text we got)
      await this.searchService.indexDocument(document, text);

      // 3. Store extracted text in DB if available
      if (text) {
        await this.prisma.documentVersion.update({
          where: { id: version.id },
          data: { metadata: { extractedText: text } },
        });
      }
    } catch (error) {
      this.logger.error(
        `Intelligence processing failed for doc ${document.id}`,
        (error as Error).stack,
      );
    }
  }

  async transitionState(id: string, dto: StateTransitionDto, userId: string) {
    const document = await this.prisma.document.findUnique({ where: { id } });
    if (!document) throw new NotFoundException('Document not found');

    this.validateTransition(document.status, dto.status);

    const updated = await this.prisma.document.update({
      where: { id },
      data: { status: dto.status },
    });

    await this.logAudit(id, userId, DocumentAction.STATE_CHANGE, {
      from: document.status,
      to: dto.status,
      reason: dto.reason,
    });

    return updated;
  }

  private validateTransition(current: DocumentStatus, next: DocumentStatus) {
    const flows: Record<DocumentStatus, DocumentStatus[]> = {
      [DocumentStatus.DRAFT]: [DocumentStatus.UNDER_REVIEW, DocumentStatus.ARCHIVED],
      [DocumentStatus.UNDER_REVIEW]: [
        DocumentStatus.DRAFT,
        DocumentStatus.PENDING_SIGNATURE,
        DocumentStatus.ARCHIVED,
      ],
      [DocumentStatus.PENDING_SIGNATURE]: [
        DocumentStatus.UNDER_REVIEW,
        DocumentStatus.EXECUTED,
        DocumentStatus.ARCHIVED,
      ],
      [DocumentStatus.EXECUTED]: [DocumentStatus.ARCHIVED],
      [DocumentStatus.ARCHIVED]: [DocumentStatus.DRAFT],
    };

    if (!flows[current].includes(next)) {
      throw new ForbiddenException(`Invalid state transition from ${current} to ${next}`);
    }
  }

  async grantAccess(documentId: string, dto: GrantAccessDto, granterId: string) {
    return this.prisma.documentAccess.upsert({
      where: { documentId_userId: { documentId, userId: dto.userId } },
      update: { permission: dto.permission },
      create: {
        documentId,
        userId: dto.userId,
        permission: dto.permission,
        grantedBy: granterId,
      },
    });
  }

  async search(
    query: string,
    filters: { orgId: string; workspaceId?: string; matterId?: string },
  ): Promise<Record<string, unknown>[]> {
    return await this.searchService.search(query, filters);
  }

  async getAudits(documentId: string) {
    return this.prisma.documentAudit.findMany({
      where: { documentId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, dto: UpdateDocumentDto, userId: string) {
    const updated = await this.prisma.document.update({
      where: { id },
      data: {
        title: dto.title,
        isConfidential: dto.isConfidential,
        metadata: dto.metadata as Prisma.InputJsonValue,
      },
    });
    await this.logAudit(id, userId, DocumentAction.UPDATE);
    return updated;
  }

  async remove(id: string, userId: string) {
    await this.prisma.document.update({
      where: { id },
      data: { status: DocumentStatus.ARCHIVED }, // Soft delete / Archive
    });
    await this.logAudit(id, userId, DocumentAction.DELETE);
    return { success: true };
  }

  private async logAudit(
    documentId: string,
    userId: string,
    action: DocumentAction,
    details?: Prisma.InputJsonValue,
  ) {
    await this.prisma.documentAudit.create({
      data: { documentId, userId, action, details },
    });
  }
}
