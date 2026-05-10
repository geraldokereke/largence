import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma/prisma.service';
import { OrganisationsController } from './organisations.controller';

@Module({
  imports: [AuthModule],
  controllers: [OrganisationsController],
  providers: [PrismaService],
})
export class OrganisationsModule {}
