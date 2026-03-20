import { Injectable } from '@nestjs/common';
import { SyncNotificationDto } from '../../features/notifications/dto/sync-notification.dto';
import {
  BaseNotificationParser,
  ParsedNotification,
} from './base-notification.parser';

/**
 * Parser for BNI / BNI Mobile Banking (src.com.bni)
 *
 * Real patterns:
 *   INCOME:  "Kredit Rp3.000.000 dari GAJI BULAN INI"
 *   EXPENSE: "Debit Rp200.000 pembayaran Tokopedia"
 *   TRANSFER:"Transfer ke BCA 1234xxx Rp500.000 berhasil"
 */
@Injectable()
export class BniNotificationParser extends BaseNotificationParser {
  canParse(app: string): boolean {
    return /src\.com\.bni|bni/i.test(app);
  }

  parse(dto: SyncNotificationDto): ParsedNotification | null {
    const { title, text, app } = dto;
    const amount = this.extractAmount(`${title} ${text}`);
    if (!amount) return null;
    const type = this.detectType(title, text);
    return {
      transactionType: type,
      amount,
      walletName: 'BNI',
      categoryName: this.guessCategory(type, title, text),
      isMirrorEvent: this.detectMirrorEvent(title, text),
      fingerprint: this.buildFingerprint(app, type, amount, title, text),
    };
  }
}
