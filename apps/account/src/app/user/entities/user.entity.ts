import {
  IDomainEvent,
  IUser,
  IUserCourses,
  PurchaseState,
  UserRole,
} from '@nodejs-microservices/interfaces';
import { compare, genSalt, hash } from 'bcryptjs';
import { AccountChangedCourse } from '@nodejs-microservices/contracts';

export class UserEntity implements IUser {
  _id!: string | undefined;
  displayName?: string;
  email: string;
  passwordHash = '';
  role: UserRole;
  courses?: IUserCourses[];
  events: IDomainEvent[] = [];

  constructor(user: IUser) {
    this._id = user._id;
    this.displayName = user.displayName;
    this.passwordHash = user.passwordHash;
    this.email = user.email;
    this.role = user.role;
    this.courses = user.courses;
  }

  async setPassword(password: string) {
    const salt = await genSalt(10);
    this.passwordHash = await hash(password, salt);
    return this;
  }

  validatePassword(password: string) {
    return compare(password, this.passwordHash);
  }

  updateProfile(displayName: string) {
    this.displayName = displayName;
    return this;
  }

  getPublicProfile() {
    return {
      email: this.email,
      role: this.role,
      displayName: this.displayName,
    };
  }

  setCourseStatus(courseId: string, state: PurchaseState) {
    const exists = this.courses?.find((course) => course.courseId === courseId);

    if (!exists) {
      this.courses?.push({
        courseId,
        purchaseState: PurchaseState.Started,
      });

      return this;
    }

    if (state === PurchaseState.Canceled) {
      this.courses = this.courses?.filter(
        (course) => course.courseId !== courseId
      );
    }

    this.courses = this.courses?.map((course) => {
      if (course.courseId === courseId) {
        course.purchaseState = state;
        return course;
      }

      return course;
    });

    this.events?.push({
      topic: AccountChangedCourse.topic,
      data: { courseId, userId: this._id, state },
    });

    return this;
  }
}
