import { Injectable } from '@nestjs/common';
import { SyncNotificationDto } from '../../features/notifications/dto/sync-notification.dto';
import {
  BaseNotificationParser,
  ParsedNotification,
} from './base-notification.parser';

/**
 * Parser for LinkAja (com.telkom.mewallet)
 *
 * Real patterns:
 *   INCOME:  "Saldo LinkAja kamu bertambah Rp50.000"
 *   EXPENSE: "Pembayaran Rp25.000 ke Grab berhasil"
 *   TRANSFER:"Kirim uang Rp100.000 ke 081xxxxxxx berhasil"
 */
@Injectable()
export class LinkAjaNotificationParser extends BaseNotificationParser {
  canParse(app: string): boolean {
    return /mewallet|linkaja/i.test(app);
  }
  parse(dto: SyncNotificationDto): ParsedNotification | null {
    const { title, text, app } = dto;
    const amount = this.extractAmount(`${title} ${text}`);
    if (!amount) return null;
    const type = this.detectType(title, text);
    return {
      transactionType: type,
      amount,
      walletName: 'LinkAja',
      categoryName: this.guessCategory(type, title, text),
      note: this.buildNote(title, text),
      isMirrorEvent: this.detectMirrorEvent(title, text),
      fingerprint: this.buildFingerprint(app, type, amount, title, text),
    };
  }
}
