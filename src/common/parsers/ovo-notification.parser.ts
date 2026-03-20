import { Injectable } from '@nestjs/common';
import { SyncNotificationDto } from '../../features/notifications/dto/sync-notification.dto';
import {
  BaseNotificationParser,
  ParsedNotification,
} from './base-notification.parser';

/**
 * Parser for OVO (ovo.id)
 *
 * Real patterns:
 *   INCOME:  "Selamat! OVO Cash kamu bertambah Rp10.000 dari OVO Points"
 *   INCOME:  "Transfer Masuk Rp250.000 diterima"
 *   EXPENSE: "Pembayaran ke Grab senilai Rp45.000 berhasil"
 *   EXPENSE: "Transaksi OVO Cash Rp80.000 di Tokopedia berhasil"
 */
@Injectable()
export class OvoNotificationParser extends BaseNotificationParser {
  canParse(app: string): boolean {
    return /ovo\.id|ovo/i.test(app);
  }
  parse(dto: SyncNotificationDto): ParsedNotification | null {
    const { title, text, app } = dto;
    const amount = this.extractAmount(`${title} ${text}`);
    if (!amount) return null;
    const type = this.detectType(title, text);
    return {
      transactionType: type,
      amount,
      walletName: 'OVO',
      categoryName: this.guessCategory(type, title, text),
      note: this.buildNote(title, text),
      isMirrorEvent: this.detectMirrorEvent(title, text),
      fingerprint: this.buildFingerprint(app, type, amount, title, text),
    };
  }
}
