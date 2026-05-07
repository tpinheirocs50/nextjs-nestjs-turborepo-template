import { env } from './env';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });
  app.useLogger(app.get(Logger));
  app.enableCors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  });
  await app.listen(env.PORT);
}
void bootstrap();
