import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { env } from '../env';
import { PrismaClient } from './generated/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(@InjectPinoLogger(PrismaService.name) logger: PinoLogger) {
    super({
      adapter: new PrismaPg(
        {
          connectionString: env.DATABASE_URL,
          max: 10,
          // pg defaults this to 0, meaning "wait forever". A database that has
          // gone away (a failover, a restart) would then hang every new
          // connection attempt instead of surfacing an error.
          connectionTimeoutMillis: 10_000,
          idleTimeoutMillis: 30_000,
        },
        {
          // Without these the pool's errors reach only the `debug` package,
          // which is off unless DEBUG is set — so failovers and dropped
          // connections would be invisible in production logs.
          onPoolError: (err) => logger.error({ err }, 'Postgres pool error'),
          onConnectionError: (err) =>
            logger.error({ err }, 'Postgres connection error'),
        },
      ),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
