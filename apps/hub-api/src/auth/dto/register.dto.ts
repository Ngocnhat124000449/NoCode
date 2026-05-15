import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @Matches(/^\+?[0-9]{9,15}$/, { message: 'phone must be a valid number' })
  phone!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
