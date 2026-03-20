import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleSignInDto {
  @IsNotEmpty()
  @IsString()
  idToken: string; // Cuma ini yang kita butuhkan sekarang!
}
