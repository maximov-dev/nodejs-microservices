import { IsEmail, IsString } from "class-validator";
import { Optional } from "@nestjs/common";

export class RegisterDto {
  @IsEmail()
  email!: string;
  @IsString()
  password!: string;
  @Optional()
  @IsString()
  displayName?: string;
}
