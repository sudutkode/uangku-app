import { Injectable } from '@nestjs/common';
import { SyncNotificationDto } from '../dto/sync-notification.dto';
import {
  BaseNotificationParser,
  ParsedNotification,
} from './base-notification.parser';

@Injectable()
export class GopayNotificationParser extends BaseNotificationParser {
  canParse(app: string): boolean {
    return app === 'com.gojek.gopay';
  }

  parse(dto: SyncNotificationDto): ParsedNotification | null {
    const { title, text, app } = dto;
    const amount = this.extractAmount(`${title} ${text}`);
    if (!amount) return null;
    const type = this.detectType(title, text);
    return {
      transactionType: type,
      amount,
      walletName: 'GoPay',
      note: this.buildNote(title, text),
      isMirrorEvent: this.detectMirrorEvent(title, text),
      fingerprint: this.buildFingerprint(app, type, amount),
    };
  }
}
