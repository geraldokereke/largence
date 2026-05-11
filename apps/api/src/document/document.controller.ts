import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Organisation, Role, User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentOrg } from '../common/decorators/current-org.decorator';
import { DocumentService } from './document.service';
import {
  CreateDocumentDto,
  GrantAccessDto,
  StateTransitionDto,
  UpdateDocumentDto,
} from './dto/document.dto';

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('documents')
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new document entry' })
  async create(
    @Body() dto: CreateDocumentDto,
    @CurrentUser() user: User,
    @CurrentOrg() org: Organisation,
  ) {
    return this.documentService.create(dto, user.id, org.id);
  }

  @Post('bulk-upload')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Bulk upload multiple documents' })
  @UseInterceptors(FilesInterceptor('files'))
  async bulkUpload(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('workspaceId') workspaceId: string,
    @Body('matterId') matterId: string,
    @CurrentUser() user: User,
    @CurrentOrg() org: Organisation,
  ) {
    return this.documentService.bulkUpload(files, workspaceId, user.id, org.id, matterId);
  }

  @Post(':id/upload')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a new version of a document' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadVersion(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
    @Body('changeLog') changeLog?: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required in the "file" field');
    }
    return this.documentService.uploadVersion(
      id,
      file.buffer,
      file.originalname,
      user.id,
      changeLog,
    );
  }

  @Post(':id/restore/:versionNumber')
  @ApiOperation({ summary: 'Restore a previous version' })
  async restore(
    @Param('id') id: string,
    @Param('versionNumber') versionNumber: number,
    @CurrentUser() user: User,
  ) {
    return this.documentService.restoreVersion(id, versionNumber, user.id);
  }

  @Get(':id/diff/:v1/:v2')
  @ApiOperation({ summary: 'Compare text between two versions' })
  async diff(@Param('id') id: string, @Param('v1') v1: number, @Param('v2') v2: number) {
    return this.documentService.diff(id, v1, v2);
  }

  @Post(':id/branch/:versionNumber')
  @ApiOperation({ summary: 'Branch a document from a specific version' })
  async branch(
    @Param('id') id: string,
    @Param('versionNumber') versionNumber: number,
    @CurrentUser() user: User,
  ) {
    return this.documentService.branch(id, versionNumber, user.id);
  }

  @Get(':id/clauses')
  @ApiOperation({ summary: 'Extract key clauses from document (stub)' })
  extractClauses() {
    return this.documentService.extractClauses();
  }

  @Post(':id/state-transition')
  @ApiOperation({ summary: 'Transition document status' })
  async transitionState(
    @Param('id') id: string,
    @Body() dto: StateTransitionDto,
    @CurrentUser() user: User,
  ) {
    return this.documentService.transitionState(id, dto, user.id);
  }

  @Post(':id/access/grant')
  @ApiOperation({ summary: 'Grant granular access to a document' })
  async grantAccess(
    @Param('id') id: string,
    @Body() dto: GrantAccessDto,
    @CurrentUser() user: User,
  ) {
    return this.documentService.grantAccess(id, dto, user.id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Full-text search across documents' })
  async search(
    @Query('q') q: string,
    @Query('matterId') matterId: string,
    @Query('workspaceId') workspaceId: string,
    @CurrentOrg() org: Organisation,
  ): Promise<Record<string, unknown>[]> {
    return await this.documentService.search(q, {
      orgId: org.id,
      workspaceId,
      matterId,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update document metadata' })
  async update(@Param('id') id: string, @Body() dto: UpdateDocumentDto, @CurrentUser() user: User) {
    return this.documentService.update(id, dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.documentService.remove(id, user.id);
  }

  @Get(':id/audit')
  @Roles(Role.PLATFORM_ADMIN, Role.ORG_ADMIN)
  @ApiOperation({ summary: 'Get document audit trail' })
  async getAudit(@Param('id') id: string) {
    return this.documentService.getAudits(id);
  }
}
