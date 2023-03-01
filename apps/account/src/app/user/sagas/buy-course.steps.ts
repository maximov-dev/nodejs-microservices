import { BuyCourseSagaState } from './buy-course.state';
import { UserEntity } from '../entities/user.entity';
import { CourseGetCourse, PaymentStatus, PaymentGenerateLink, PaymentCheck, } from '@nodejs-microservices/contracts';
import { PurchaseState } from '@nodejs-microservices/interfaces';

export class BuyCourseSagaStateStarted extends BuyCourseSagaState {
  cancel(): { user: UserEntity } {
    this.saga.setState(PurchaseState.Canceled, this.saga.courseId);

    return {
      user: this.saga.user,
    };
  }

  checkPayment(): Promise<{ user: UserEntity; status:PaymentStatus; }> {
    throw new Error('Can not check the payment');
  }

  async pay(): Promise<{ paymentLink: string | null; user: UserEntity }> {
    const { course } = await this.saga.rmqService.send<
      CourseGetCourse.Request,
      CourseGetCourse.Response
    >(CourseGetCourse.topic, {
      id: this.saga.courseId,
    });

    if (!course) {
      throw new Error('There is no course with such name');
    }

    if (course.price === 0) {
      this.saga.setState(PurchaseState.Purchased, course._id);

      return { paymentLink: null, user: this.saga.user };
    }

    const { paymentLink } = await this.saga.rmqService.send<
      PaymentGenerateLink.Request,
      PaymentGenerateLink.Response
    >(PaymentGenerateLink.topic, <PaymentGenerateLink.Request>{
      courseId: course._id,
      userId: this.saga.user._id,
      sum: course.price,
    });

    this.saga.setState(PurchaseState.WaitingForPayment, course._id);

    return { paymentLink, user: this.saga.user };
  }
}

export class BuyCourseSagaStateWaitingForPayment extends BuyCourseSagaState {
  cancel(): { user: UserEntity } {
    throw new Error('Can not cancel the payment');
  }

  async checkPayment(): Promise<{ user: UserEntity; status:PaymentStatus; }> {
    const { status } = await this.saga.rmqService.send<
      PaymentCheck.Request,
      PaymentCheck.Response
    >(PaymentCheck.topic, {
      userId: this.saga.user._id,
      courseId: this.saga.courseId,
    });

    if (status === 'cancelled') {
      this.saga.setState(PurchaseState.Canceled, this.saga.courseId);
      return { user: this.saga.user, status: 'cancelled' };
    }

    if (status !== 'success') {
      return { user: this.saga.user, status: 'success' }
    }

    this.saga.setState(PurchaseState.Purchased, this.saga.courseId);
    return { user: this.saga.user, status: 'progress' };
  }

  async pay(): Promise<{ paymentLink: string | null; user: UserEntity }> {
    throw new Error('Can not create a link when processing');
  }
}

export class BuyCourseSagaStatePurchased extends BuyCourseSagaState {
  cancel(): { user: UserEntity } {
    throw new Error('Can not cancel')
  }

  checkPayment(): Promise<{ user: UserEntity; status:PaymentStatus; }> {
    throw new Error('Can not check the payment')
  }

  pay(): Promise<{ paymentLink: string | null; user: UserEntity }> {
    throw new Error('Can not pay for that if you already bought the course')
  }

}

export class BuyCourseSagaStateCancelled extends BuyCourseSagaState {
  cancel(): { user: UserEntity } {
    throw new Error('Can not cancel')
  }

  checkPayment(): Promise<{ user: UserEntity; status:PaymentStatus; }> {
    throw new Error('Can not check the payment')
  }

  pay(): Promise<{ paymentLink: string | null; user: UserEntity }> {
    this.saga.setState(PurchaseState.Started, this.saga.courseId);
    return this.saga.getState().pay();
  }

}
