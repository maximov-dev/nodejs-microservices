import { Body, Controller } from '@nestjs/common';
import { RMQRoute, RMQValidate } from "nestjs-rmq";
import { AccountUserCourses, AccountUserInfo } from "@nodejs-microservices/contracts";
import { UserRepository } from "./repositories/user.repository";
import { NotFoundError } from "rxjs";
import { UserEntity } from "./entities/user.entity";

@Controller()
export class UserQueries {
  constructor(private readonly userRepository: UserRepository) {
  }
  @RMQValidate()
  @RMQRoute(AccountUserInfo.topic)
  async userInfo(@Body() { id }: AccountUserInfo.Request): Promise<AccountUserInfo.Response> {
    const user = await this.userRepository.findUserById(id);

    if (!user) {
      throw new NotFoundError('User does not exist');
    }

    const userEntity = new UserEntity(user);
    const publicProfile = userEntity.getPublicProfile();

    return {
      profile: publicProfile,
    };
  }

  @RMQValidate()
  @RMQRoute(AccountUserCourses.topic)
  async userCourses(@Body() { id }: AccountUserCourses.Request): Promise<AccountUserCourses.Response> {
    const user = await this.userRepository.findUserById(id);

    if (!user) {
      throw new NotFoundError('User does not exist');
    }

    return {
      courses: user.courses
    };
  }
}
