import { Injectable } from '@nestjs/common';
import { SyncNotificationDto } from '../../features/notifications/dto/sync-notification.dto';
import {
  BaseNotificationParser,
  ParsedNotification,
} from './base-notification.parser';

/**
 * Parser for Bank Mandiri / Livin (com.bankmandiri.mandirionline)
 *
 * Real patterns:
 *   INCOME:  "Uang masuk Rp1.000.000 dari BUDI SANTOSO"
 *   EXPENSE: "Transaksi Debit Rp250.000 di Indomaret"
 *   TRANSFER:"Transfer ke BNI 9876543210 Rp500.000 berhasil"
 *   EXPENSE: "Pembayaran BPJS Rp150.000 berhasil"
 */
@Injectable()
export class MandiriNotificationParser extends BaseNotificationParser {
  canParse(app: string): boolean {
    return /mandiri|livin/i.test(app);
  }
  parse(dto: SyncNotificationDto): ParsedNotification | null {
    const { title, text, app } = dto;
    const amount = this.extractAmount(`${title} ${text}`);
    if (!amount) return null;
    const type = this.detectType(title, text);
    return {
      transactionType: type,
      amount,
      walletName: 'Mandiri',
      note: this.buildNote(title, text),
      isMirrorEvent: this.detectMirrorEvent(title, text),
      fingerprint: this.buildFingerprint(app, type, amount),
    };
  }
}
