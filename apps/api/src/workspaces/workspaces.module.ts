import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TierService } from '../common/services/tier.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';

@Module({
  imports: [AuthModule],
  controllers: [WorkspacesController],
  providers: [PrismaService, TierService, WorkspacesService],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
