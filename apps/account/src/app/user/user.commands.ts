import { BadRequestException, Body, Controller } from '@nestjs/common';
import { RMQRoute, RMQValidate } from "nestjs-rmq";
import { AccountChangeProfile } from "@nodejs-microservices/contracts";
import { UserRepository } from "./repositories/user.repository";
import { NotFoundError } from "rxjs";
import { UserEntity } from "./entities/user.entity";

@Controller()
export class UserCommands {
  constructor(private readonly userRepository: UserRepository) {}
  @RMQValidate()
  @RMQRoute(AccountChangeProfile.topic)
  async changeProfile(@Body() { id, user }: AccountChangeProfile.Request): Promise<AccountChangeProfile.Response> {
    const existingUser = await this.userRepository.findUserById(id);

    if (!existingUser) {
      throw new NotFoundError('User does not exist');
    }

    if (!user.displayName) {
      throw new BadRequestException('Nothing to update');
    }

    const userEntity = new UserEntity(existingUser);
    const updatedUser = userEntity.updateProfile(user.displayName);

    await this.userRepository.updateUser(updatedUser);
    return {};
  }
}
