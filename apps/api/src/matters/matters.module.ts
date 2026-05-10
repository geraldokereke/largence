import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TierService } from '../common/services/tier.service';
import { PrismaService } from '../prisma/prisma.service';
import { BillingService } from './billing.service';
import { ConflictCheckService } from './conflict-check.service';
import { MatterAutomationService } from './matter-automation.service';
import { MattersController } from './matters.controller';
import { MattersService } from './matters.service';

@Module({
  imports: [AuthModule],
  controllers: [MattersController],
  providers: [
    PrismaService,
    TierService,
    MattersService,
    ConflictCheckService,
    MatterAutomationService,
    BillingService,
  ],
  exports: [MattersService, BillingService],
})
export class MattersModule {}
