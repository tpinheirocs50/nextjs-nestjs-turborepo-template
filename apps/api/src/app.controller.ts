import { Controller, Get } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import type { HealthCheck } from '@repo/shared-types';

@Controller()
export class AppController {
  @Get('health')
  @AllowAnonymous()
  getHealth(): HealthCheck {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
