import { IsEmail, IsOptional } from 'class-validator';

export class GoogleSignInDto {
  @IsEmail()
  email: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  avatar?: string;
}
