import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
    return this.documentService.uploadVersion(id, file.buffer, user.id, changeLog);
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
