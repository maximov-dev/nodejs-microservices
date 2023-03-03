import { Injectable } from "@nestjs/common";
import { RMQService } from "nestjs-rmq";
import { UserEntity } from "./entities/user.entity";

@Injectable()
export class UserEventEmitter {
  constructor(private readonly rmqService: RMQService) {}

  async handle(user: UserEntity) {
    const userEvents = user.events;

    if (!userEvents) return;

    for (const event of userEvents) {
      await this.rmqService.notify(event.topic, event.data);
    }
  }
}
