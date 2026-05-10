import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'error' | 'info' | 'warn'>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();

    this.$on('query', (e: Prisma.QueryEvent) => {
      this.logger.debug({
        type: 'DATABASE_QUERY',
        query: e.query,
        params: e.params,
        duration: `${e.duration}ms`,
      });
    });

    this.$on('error', (e: Prisma.LogEvent) => {
      this.logger.error({
        type: 'DATABASE_ERROR',
        message: e.message,
        target: e.target,
      });
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
