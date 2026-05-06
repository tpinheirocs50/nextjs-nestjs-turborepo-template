import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { UsersController } from './users/users.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AppController, UsersController],
  providers: [],
})
export class AppModule {}
