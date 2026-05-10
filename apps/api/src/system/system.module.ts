import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SystemController } from './system.controller';

@Module({
  controllers: [SystemController],
  providers: [PrismaService],
})
export class SystemModule {}
