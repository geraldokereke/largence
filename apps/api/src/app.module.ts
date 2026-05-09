import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DatabaseModule } from './shared/database/database.module';
import { RedisModule } from './shared/redis/redis.module';
import { CacheModule } from './shared/cache/cache.module';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GatewayModule } from './gateway/gateway.module';
import { OrganisationsModule } from './organisations/organisations.module';
import { AuditModule } from './audit/audit.module';
import { DocumentModule } from './document/document.module';
import { TemplateModule } from './template/template.module';
import { MatterModule } from './matter/matter.module';
import { KnowledgeGraphModule } from './knowledge-graph/knowledge-graph.module';
import { GenerationModule } from './generation/generation.module';
import { ResearchModule } from './research/research.module';
import { ComplianceModule } from './compliance/compliance.module';
import { NotificationModule } from './notification/notification.module';
import { ClientPortalModule } from './client-portal/client-portal.module';
import { CollaborationModule } from './collaboration/collaboration.module';
import { SigningModule } from './signing/signing.module';
import { BillingModule } from './billing/billing.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AgentModule } from './agent/agent.module';
import { AutomationModule } from './automation/automation.module';
import { EvidenceModule } from './evidence/evidence.module';
import { IntegrationModule } from './integration/integration.module';

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    CacheModule,

    AuthModule,
    UserModule,
    GatewayModule,
    OrganisationsModule,
    AuditModule,
    DocumentModule,
    TemplateModule,
    MatterModule,
    KnowledgeGraphModule,
    GenerationModule,
    ResearchModule,
    ComplianceModule,
    NotificationModule,
    ClientPortalModule,
    CollaborationModule,
    SigningModule,
    BillingModule,
    AnalyticsModule,
    AgentModule,
    AutomationModule,
    EvidenceModule,
    IntegrationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
