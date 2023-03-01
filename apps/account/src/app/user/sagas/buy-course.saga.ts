import { UserEntity } from "../entities/user.entity";
import { RMQService } from "nestjs-rmq";
import { PurchaseState } from "@nodejs-microservices/interfaces";
import { BuyCourseSagaState } from "./buy-course.state";
import {BuyCourseSagaStatePurchased, BuyCourseSagaStateWaitingForPayment, BuyCourseSagaStateStarted} from "./buy-course.steps";

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
        this.state = new BuyCourseSagaStateStarted();
        break;
      case PurchaseState.WaitingForPayment:
        this.state = new BuyCourseSagaStateWaitingForPayment();
        break;
      case PurchaseState.Purchased:
        this.state = new BuyCourseSagaStatePurchased();
        break;
      case PurchaseState.Canceled:
        this.state = new BuyCourseSagaStatePurchased()
        break;
    }
    this.state.setContext(this);
    this.user.setCourseStatus(courseId, state);

  }
}
