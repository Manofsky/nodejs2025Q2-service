import { IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(1)
  login: string;

  @IsString()
  @MinLength(3)
  password: string;
}
