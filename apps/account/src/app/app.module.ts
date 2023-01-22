import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { CoreModule } from './core/core.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [CoreModule, AuthModule, UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
