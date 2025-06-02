import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @MinLength(3)
  oldPassword: string;

  @IsString()
  @MinLength(3)
  newPassword: string;
}
