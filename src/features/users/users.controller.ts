import {
  Controller,
  Get,
  Delete,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@Request() req) {
    return req.user;
  }

  @Patch('me')
  async updateProfile(@Request() req, @Body() dto: UpdateUserDto) {
    // req.user didapat dari JwtStrategy yang kita buat tadi
    return this.usersService.update(req.user.id, dto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(@Request() req) {
    await this.usersService.remove(req.user.id);
  }
}
