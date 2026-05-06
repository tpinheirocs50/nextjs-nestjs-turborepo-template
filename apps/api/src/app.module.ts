import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { env } from './env';
import { PrismaModule } from './prisma/prisma.module';
import { UsersController } from './users/users.controller';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: env.LOG_LEVEL,
        transport:
          env.NODE_ENV === 'development'
            ? {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                  colorize: true,
                  translateTime: 'HH:MM:ss.l',
                  ignore: 'pid,hostname,req.headers,res.headers',
                },
              }
            : undefined,
        autoLogging: env.NODE_ENV !== 'test',
        customProps: () => ({
          context: 'HTTP',
        }),
      },
    }),
    PrismaModule,
  ],
  controllers: [AppController, UsersController],
  providers: [],
})
export class AppModule {}
