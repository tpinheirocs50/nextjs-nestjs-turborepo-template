import { Controller, Get } from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

@Controller('me')
export class MeController {
  @Get()
  getMe(@Session() session: UserSession) {
    return {
      user: session.user,
      session: {
        id: session.session.id,
        expiresAt: session.session.expiresAt,
      },
    };
  }
}
