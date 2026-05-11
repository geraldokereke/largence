import { Module } from '@nestjs/common';
import { OcrService } from '../common/services/ocr.service';
import { SearchService } from '../common/services/search.service';
import { StorageService } from '../common/services/storage.service';
import { PrismaService } from '../prisma/prisma.service';
import { TemplateController } from './template.controller';
import { TemplateService } from './template.service';

@Module({
  controllers: [TemplateController],
  providers: [TemplateService, PrismaService, StorageService, SearchService, OcrService],
  exports: [TemplateService],
})
export class TemplateModule {}
