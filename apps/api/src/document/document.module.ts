import { Module } from '@nestjs/common';
import { OcrService } from '../common/services/ocr.service';
import { SearchService } from '../common/services/search.service';
import { StorageService } from '../common/services/storage.service';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { RetentionService } from './retention.service';

@Module({
  controllers: [DocumentController],
  providers: [
    DocumentService,
    PrismaService,
    StorageService,
    SearchService,
    OcrService,
    RetentionService,
  ],
  exports: [DocumentService],
})
export class DocumentModule {}
