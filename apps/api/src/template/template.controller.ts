import {
  BadRequestException,
  Body,
  Controller,
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
import { Organisation, TemplateTier, User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentOrg } from '../common/decorators/current-org.decorator';
import {
  CreateTemplateDto,
  CreateTemplateVersionDto,
  InstantiateTemplateDto,
  UpdateTemplateDto,
} from './dto/template.dto';
import { TemplateService } from './template.service';

@ApiTags('templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new template' })
  async create(
    @Body() dto: CreateTemplateDto,
    @CurrentUser() user: User,
    @CurrentOrg() org: Organisation,
  ): Promise<any> {
    return this.templateService.create(dto, user.id, org.id);
  }

  @Get()
  @ApiOperation({ summary: 'List templates with filtering' })
  async findAll(
    @Query('tier') tier: TemplateTier,
    @Query('categoryId') categoryId: string,
    @CurrentOrg() org: Organisation,
  ): Promise<any> {
    return this.templateService.findAll({ tier, categoryId, orgId: org.id });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search templates' })
  async search(@Query('q') q: string, @CurrentOrg() org: Organisation): Promise<any> {
    return this.templateService.search(q, org.id);
  }

  @Get('marketplace')
  @ApiOperation({ summary: 'List marketplace templates' })
  async findMarketplace(@Query('categoryId') categoryId: string): Promise<any> {
    return this.templateService.findAll({ tier: TemplateTier.PROFESSIONAL, categoryId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template details' })
  async findOne(@Param('id') id: string): Promise<any> {
    return this.templateService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update template' })
  async update(@Param('id') id: string, @Body() dto: UpdateTemplateDto): Promise<any> {
    return this.templateService.update(id, dto);
  }

  @Post(':id/versions')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new template version' })
  @UseInterceptors(FileInterceptor('file'))
  async createVersion(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateTemplateVersionDto,
    @CurrentUser() user: User,
  ): Promise<any> {
    if (!file) throw new BadRequestException('File is required');
    return this.templateService.createVersion(id, dto, file.buffer, user.id);
  }

  @Post(':id/review/submit')
  @ApiOperation({ summary: 'Submit template for review' })
  async submitForReview(@Param('id') id: string): Promise<any> {
    return this.templateService.submitForReview(id);
  }

  @Patch(':id/review/approve')
  @ApiOperation({ summary: 'Approve template and publish' })
  async approveReview(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body('comments') comments?: string,
  ): Promise<any> {
    return this.templateService.approveReview(id, user.id, comments);
  }

  @Patch(':id/review/reject')
  @ApiOperation({ summary: 'Reject template review' })
  async rejectReview(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body('comments') comments: string,
  ): Promise<any> {
    return this.templateService.rejectReview(id, user.id, comments);
  }

  @Post(':id/instantiate')
  @ApiOperation({ summary: 'Create a document from template' })
  async instantiate(
    @Param('id') id: string,
    @Body() dto: InstantiateTemplateDto,
    @CurrentUser() user: User,
    @CurrentOrg() org: Organisation,
  ): Promise<any> {
    return this.templateService.instantiate(id, dto, user.id, org.id);
  }
}
