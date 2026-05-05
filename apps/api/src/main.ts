import { env } from './env';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: env.CORS_ORIGIN });
  await app.listen(env.PORT);
}
void bootstrap();
