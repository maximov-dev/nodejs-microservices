import { BuyCourseSagaState } from "./buy-course.state";
import { UserEntity } from "../entities/user.entity";
import { CourseGetCourse, PaymentGenerateLink } from "@nodejs-microservices/contracts";
import { PurchaseState } from "@nodejs-microservices/interfaces";

export class BuyCourseSagaStepStarted extends BuyCourseSagaState {
  cancel(): { user: UserEntity } {
    this.saga.setState(PurchaseState.Canceled, this.saga.courseId);

    return {
      user: this.saga.user,
    }
  }

  checkPayment(): Promise<{ user: UserEntity }> {
    throw new Error('Can not check the payment');
  }

  async pay(): Promise<{ paymentLink: string | null; user: UserEntity }> {
    const { course } = await this.saga.rmqService.send<CourseGetCourse.Request, CourseGetCourse.Response>(CourseGetCourse.topic, {
      id: this.saga.courseId,
    });

    if (!course) {
      throw new Error('There is no course with such name');
    }

    if (course.price === 0) {
      this.saga.setState(PurchaseState.Purchased, course._id);

      return { paymentLink: null, user: this.saga.user };
    }

    const { paymentLink } = await this.saga.rmqService.send<PaymentGenerateLink.Request, PaymentGenerateLink.Response>(PaymentGenerateLink.topic, {
      courseId: course._id,
      userId: this.saga.user._id,
      sum: course.price,
    });


    this.saga.setState(PurchaseState.WaitingForPayment, course._id);

    return { paymentLink, user: this.saga.user };
  }

}
