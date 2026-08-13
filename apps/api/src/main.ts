import { env } from './env';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    // bodyParser: false is required by Better Auth so it can read raw request
    // bodies. The @thallesp/nestjs-better-auth library re-registers standard
    // body parsers for non-auth routes automatically — you don't need to add
    // body-parser middleware yourself.
    bodyParser: false,
  });
  app.useLogger(app.get(Logger));
  app.use(helmet());
  app.enableCors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  // Without this Nest never installs SIGTERM/SIGINT handlers, so `docker stop`
  // and every redeploy sever in-flight requests and skip Prisma's $disconnect.
  app.enableShutdownHooks();
  await app.listen(env.PORT);
}
void bootstrap();
