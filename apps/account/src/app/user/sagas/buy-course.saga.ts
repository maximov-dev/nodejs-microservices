import { UserEntity } from "../entities/user.entity";
import { RMQService } from "nestjs-rmq";
import { PurchaseState } from "@nodejs-microservices/interfaces";
import { BuyCourseSagaState } from "./buy-course.state";
import {BuyCourseSagaStepStarted} from "./buy-course.steps";

export class BuyCourseSaga {
  private state!: BuyCourseSagaState;

  constructor(public user: UserEntity, public courseId: string, public rmqService: RMQService) {

  }

  getState() {
    if (!this.state) throw Error('No state');

    return this.state;
  }

  setState(state: PurchaseState, courseId: string) {
    switch (state) {
      case PurchaseState.Started:
        this.state = new BuyCourseSagaStepStarted();
        break;
      case PurchaseState.WaitingForPayment:
        break;
      case PurchaseState.Purchased:
        break;
      case PurchaseState.Canceled:
        break;
    }
    this.state.setContext(this);
    this.user.updateCourseStatus(courseId, state);

  }
}
