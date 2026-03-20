import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';
import { SyncNotificationDto } from './dto/sync-notification.dto';
import { successResponse } from '../../common/utils/response.util';

@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async syncNotification(@Req() req, @Body() dto: SyncNotificationDto) {
    const result = await this.notificationsService.processNotification(
      req.user,
      dto,
    );

    if (result.status === 'ignored') {
      return successResponse(
        null,
        'Notification ignored (not a valid transaction)',
        HttpStatus.OK,
      );
    }

    if (result.status === 'duplicate') {
      return successResponse(
        null,
        'Transaction already recorded',
        HttpStatus.OK,
      );
    }

    return successResponse(
      result.transaction,
      'Transaction recorded from notification',
      HttpStatus.CREATED,
    );
  }
}
