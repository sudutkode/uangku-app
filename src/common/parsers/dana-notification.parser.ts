import { Injectable } from '@nestjs/common';
import { SyncNotificationDto } from '../../features/notifications/dto/sync-notification.dto';
import {
  BaseNotificationParser,
  ParsedNotification,
} from './base-notification.parser';

/**
 * Parser for DANA (id.dana)
 *
 * Real patterns:
 *   INCOME:  "Kamu menerima Rp100.000 dari Andi"
 *   INCOME:  "Top Up DANA Rp200.000 berhasil"
 *   EXPENSE: "Kamu telah membayar Rp30.000 ke Tokopedia"
 *   EXPENSE: "Pembayaran DANA Rp55.000 ke DANA Merchant berhasil"
 *   TRANSFER:"Transfer ke 081xxxxxxx Rp75.000 berhasil"
 */
@Injectable()
export class DanaNotificationParser extends BaseNotificationParser {
  canParse(app: string): boolean {
    return /id\.dana|dana/i.test(app);
  }
  parse(dto: SyncNotificationDto): ParsedNotification | null {
    const { title, text, app } = dto;
    const combined = `${title} ${text}`;
    const amount = this.extractAmount(combined);
    if (!amount) return null;
    if (/top.?up|isi saldo/i.test(combined)) {
      return {
        transactionType: 'income',
        amount,
        walletName: 'DANA',
        categoryName: 'Top Up',
        note: this.buildNote(title, text),
        fingerprint: this.buildFingerprint(app, 'income', amount, title, text),
      };
    }
    const type = this.detectType(title, text);
    return {
      transactionType: type,
      amount,
      walletName: 'DANA',
      categoryName: this.guessCategory(type, title, text),
      note: this.buildNote(title, text),
      isMirrorEvent: this.detectMirrorEvent(title, text),
      fingerprint: this.buildFingerprint(app, type, amount, title, text),
    };
  }
}
