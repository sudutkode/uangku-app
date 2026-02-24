import { IsNotEmpty } from 'class-validator';
import { SignInDto } from './sign-in.dto';

export class SignUpDto extends SignInDto {
  @IsNotEmpty()
  name: string;
}
