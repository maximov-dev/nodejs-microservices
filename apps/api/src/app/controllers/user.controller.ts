import { Controller, Get } from '@nestjs/common';
import { UserId } from "../guards/user.decorator";

@Controller('user')
export class UserController {
  constructor() {}

  @Get('info')
  async info(@UserId() userId: string) {
  }
}
