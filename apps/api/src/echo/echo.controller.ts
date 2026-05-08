import { Body, Controller, Post } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { IsEmail, IsString, MinLength } from 'class-validator';

class EchoDto {
  @IsString()
  @MinLength(1)
  message!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

@Controller('echo')
export class EchoController {
  /**
   * Demonstrates request body validation via class-validator + ValidationPipe.
   * The global ValidationPipe rejects requests that don't match the DTO with a 400 response.
   * Public endpoint so anyone (curl, tests) can see validation in action without auth.
   */
  @Post()
  @AllowAnonymous()
  echo(@Body() body: EchoDto) {
    return {
      received: body,
      message: 'Validation passed. ValidationPipe verified all fields.',
    };
  }
}
