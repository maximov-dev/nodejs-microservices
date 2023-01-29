import {IsObject, IsString} from 'class-validator';
import {IUser, IUserCourses} from "@nodejs-microservices/interfaces";

export namespace AccountChangeProfile {

  export const topic = 'account.change-profile.command';

  export class Request {
    @IsString()
    id!: string;

    @IsObject()
    user!: Pick<IUser, 'displayName'>;
  }

  export class Response {}
}
