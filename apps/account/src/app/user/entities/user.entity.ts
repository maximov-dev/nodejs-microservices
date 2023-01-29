import { IUser, IUserCourses, UserRole } from "@nodejs-microservices/interfaces";
import { compare, genSalt, hash } from "bcryptjs";

export class UserEntity implements IUser {
  _id?: string;
  displayName?: string;
  email: string;
  passwordHash = '';
  role: UserRole;
  courses?: IUserCourses[];

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
    }
  }
}
