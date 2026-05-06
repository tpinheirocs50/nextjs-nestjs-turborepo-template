import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { User } from '../prisma/generated/client';

@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }
}
