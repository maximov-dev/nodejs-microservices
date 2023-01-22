import { Document } from 'mongoose';
import { IUser, UserRole } from '@nodejs-microservices/interfaces';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class User extends Document implements IUser {
  @Prop()
  displayName?: string;
  @Prop({ required: true })
  email = '';
  @Prop({ required: true })
  passwordHash = '';
  @Prop({ required: true, enum: UserRole, type: String, default: UserRole.Student  })
  role = UserRole.Student;
}

export const UserSchema = SchemaFactory.createForClass(User);
