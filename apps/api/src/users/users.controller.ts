import { Controller, Get } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { PrismaService } from '../prisma/prisma.service';
import type { User } from '../prisma/generated/client';

@Controller('users')
export class UsersController {
  constructor(
    private readonly prisma: PrismaService,
    @InjectPinoLogger(UsersController.name)
    private readonly logger: PinoLogger,
  ) {}

  @Get()
  async findAll(): Promise<User[]> {
    this.logger.info('Fetching all users');
    const users = await this.prisma.user.findMany();
    this.logger.info({ count: users.length }, 'Returned users from database');
    return users;
  }
}
