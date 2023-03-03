import { BadRequestException, Injectable } from '@nestjs/common';
import {
  AccountBuyCourse,
  AccountChangeProfile,
  AccountCheckPayment,
} from '@nodejs-microservices/contracts';
import { NotFoundError } from 'rxjs';
import { UserEntity } from './entities/user.entity';
import { IUser } from '@nodejs-microservices/interfaces';
import { UserRepository } from './repositories/user.repository';
import { RMQService } from 'nestjs-rmq';
import { BuyCourseSaga } from './sagas/buy-course.saga';
import { UserEventEmitter } from './user.event-emitter';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly rmqSevice: RMQService,
    private readonly userEventEmitter: UserEventEmitter
  ) {}
  async changeProfile(
    user: Pick<IUser, 'displayName'>,
    id: string
  ): Promise<AccountChangeProfile.Response> {
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

    await this.updateUser(userEntity);

    return {};
  }

  async buyCourse(
    userId: string,
    courseId: string
  ): Promise<AccountBuyCourse.Response> {
    const existedUser = await this.userRepository.findUser(userId);

    if (!existedUser) {
      throw new Error('User does not exist');
    }

    const userEntity = new UserEntity(existedUser);
    const saga = new BuyCourseSaga(userEntity, courseId, this.rmqSevice);
    const { user, paymentLink } = await saga.getState().pay();
    await this.userRepository.updateUser(user);

    await this.updateUser(user);

    return { paymentLink };
  }

  async checkPayment(
    userId: string,
    courseId: string
  ): Promise<AccountCheckPayment.Response> {
    const existedUser = await this.userRepository.findUser(userId);

    if (!existedUser) {
      throw new Error('User does not exist');
    }

    const userEntity = new UserEntity(existedUser);
    const saga = new BuyCourseSaga(userEntity, courseId, this.rmqSevice);
    const { user, status } = await saga.getState().checkPayment();
    await this.userRepository.updateUser(user);

    await this.updateUser(user);

    return { status };
  }

  private updateUser(user: UserEntity) {
    return Promise.all([
      this.userEventEmitter.handle(user),
      this.userRepository.updateUser(user),
    ]);
  }
}
