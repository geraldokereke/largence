"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const database_module_1 = require("./shared/database/database.module");
const redis_module_1 = require("./shared/redis/redis.module");
const cache_module_1 = require("./shared/cache/cache.module");
const auth_module_1 = require("./auth/auth.module");
const user_module_1 = require("./user/user.module");
const gateway_module_1 = require("./gateway/gateway.module");
const organisations_module_1 = require("./organisations/organisations.module");
const audit_module_1 = require("./audit/audit.module");
const document_module_1 = require("./document/document.module");
const template_module_1 = require("./template/template.module");
const matter_module_1 = require("./matter/matter.module");
const knowledge_graph_module_1 = require("./knowledge-graph/knowledge-graph.module");
const generation_module_1 = require("./generation/generation.module");
const research_module_1 = require("./research/research.module");
const compliance_module_1 = require("./compliance/compliance.module");
const notification_module_1 = require("./notification/notification.module");
const client_portal_module_1 = require("./client-portal/client-portal.module");
const collaboration_module_1 = require("./collaboration/collaboration.module");
const signing_module_1 = require("./signing/signing.module");
const billing_module_1 = require("./billing/billing.module");
const analytics_module_1 = require("./analytics/analytics.module");
const agent_module_1 = require("./agent/agent.module");
const automation_module_1 = require("./automation/automation.module");
const evidence_module_1 = require("./evidence/evidence.module");
const integration_module_1 = require("./integration/integration.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            database_module_1.DatabaseModule,
            redis_module_1.RedisModule,
            cache_module_1.CacheModule,
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            gateway_module_1.GatewayModule,
            organisations_module_1.OrganisationsModule,
            audit_module_1.AuditModule,
            document_module_1.DocumentModule,
            template_module_1.TemplateModule,
            matter_module_1.MatterModule,
            knowledge_graph_module_1.KnowledgeGraphModule,
            generation_module_1.GenerationModule,
            research_module_1.ResearchModule,
            compliance_module_1.ComplianceModule,
            notification_module_1.NotificationModule,
            client_portal_module_1.ClientPortalModule,
            collaboration_module_1.CollaborationModule,
            signing_module_1.SigningModule,
            billing_module_1.BillingModule,
            analytics_module_1.AnalyticsModule,
            agent_module_1.AgentModule,
            automation_module_1.AutomationModule,
            evidence_module_1.EvidenceModule,
            integration_module_1.IntegrationModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map