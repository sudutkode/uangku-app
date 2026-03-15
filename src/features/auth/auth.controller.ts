import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { successResponse } from '../../common/utils/response.util';
import { GoogleSignInDto } from './dto/google-sign-in.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
