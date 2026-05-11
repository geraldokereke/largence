import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TenantResolverMiddleware } from './common/middleware/tenant-resolver.middleware';
import { DocumentModule } from './document/document.module';
import { MattersModule } from './matters/matters.module';
import { OrganisationsModule } from './organisations/organisations.module';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';
import { SystemModule } from './system/system.module';
import { TemplateModule } from './template/template.module';
import { UsersModule } from './users/users.module';
import { WorkspacesModule } from './workspaces/workspaces.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
        customProps: req => ({
          traceId: (req.headers as Record<string, string | string[] | undefined>)['x-trace-id'],
        }),
        serializers: {
          req: (req: Record<string, any>) => ({
            id: req.id as string,
            method: req.method as string,
            url: req.url as string,
            headers: { host: (req.headers as Record<string, any>).host as string },
          }),
        },
      },
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    SystemModule,
    DocumentModule,
    OrganisationsModule,
    TemplateModule,
    UsersModule,
    AuditModule,
    WorkspacesModule,
    MattersModule,
  ],
  providers: [
    PrismaService,
    RedisService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantResolverMiddleware)
      .exclude(
        { path: 'auth/health', method: RequestMethod.GET },
        { path: '.well-known/jwks.json', method: RequestMethod.GET },
        { path: 'system/(.*)', method: RequestMethod.ALL },
      )
      .forRoutes('*');
  }
}
