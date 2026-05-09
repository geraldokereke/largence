import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';
import { TenantResolverMiddleware } from './common/middleware/tenant-resolver.middleware';

import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
      },
    }),
    AuthModule,
  ],
  providers: [PrismaService, RedisService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantResolverMiddleware)
      .exclude(
        { path: 'auth/health', method: RequestMethod.GET },
        { path: '.well-known/jwks.json', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}
