import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { successResponse } from '../../common/utils/response.util';
import { GoogleSignInDto } from './dto/google-sign-in.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  async signUp(@Body() dto: SignUpDto) {
    const result = await this.authService.signUp(dto);
    return successResponse(
      result,
      'User registered successfully',
      HttpStatus.CREATED,
    );
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() dto: SignInDto) {
    const result = await this.authService.signIn(dto);
    return successResponse(
      result,
      'User signed in successfully',
      HttpStatus.OK,
    );
  }

  @Post('google-sign-in')
  @HttpCode(HttpStatus.OK)
  async googleSignIn(@Body() dto: GoogleSignInDto) {
    const result = await this.authService.googleSignIn(dto);
    return successResponse(
      result,
      'User signed in successfully',
      HttpStatus.OK,
    );
  }
}
