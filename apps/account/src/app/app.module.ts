import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { CoreModule } from './core/core.module';

@Module({
  imports: [UserModule, CoreModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AppModule {}
