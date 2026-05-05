import { Controller, Get } from '@nestjs/common';
import type { HealthCheck } from '@repo/shared-types';

@Controller()
export class AppController {
  @Get('health')
  getHealth(): HealthCheck {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
