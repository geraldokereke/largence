import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma/prisma.service';
import { AuditController } from './audit.controller';

@Module({
  imports: [AuthModule],
  controllers: [AuditController],
  providers: [PrismaService],
})
export class AuditModule {}
