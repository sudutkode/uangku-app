import { Injectable } from '@nestjs/common';
import { SyncNotificationDto } from '../../features/notifications/dto/sync-notification.dto';
import {
  BaseNotificationParser,
  ParsedNotification,
} from './base-notification.parser';

/**
 * Parser for BCA / myBCA (com.bca)
 *
 * BCA uses explicit CR/DB markers — most reliable signal in Indonesian banking.
 *
 * Real patterns:
 *   INCOME:  "CR Rp2.500.000 dari PT GAJI LANCAR tgl 25/12"
 *   EXPENSE: "DB Rp500.000 ke 1234567890 BUDI SANTOSO tgl 25/12"
 *   EXPENSE: "Pembayaran tagihan PLN Rp350.000 berhasil"
 *   TRANSFER:"Transfer ke BCA 1234567890 Rp1.000.000 berhasil"
 */
@Injectable()
export class BcaNotificationParser extends BaseNotificationParser {
  canParse(app: string): boolean {
    return /com\.bca|mybca/i.test(app);
  }
  parse(dto: SyncNotificationDto): ParsedNotification | null {
    const { title, text, app } = dto;
    const combined = `${title} ${text}`;
    const amount = this.extractAmount(combined);
    if (!amount) return null;
    if (this.detectType(title, text) === 'transfer') {
      return {
        transactionType: 'transfer',
        amount,
        walletName: 'BCA',
        note: this.buildNote(title, text),
        fingerprint: this.buildFingerprint(app, 'transfer', amount),
      };
    }
    const isCR = /\bCR\b/.test(combined);
    const isDB = /\bDB\b/.test(combined);
    const type: 'income' | 'expense' = isCR
      ? 'income'
      : isDB
        ? 'expense'
        : this.detectType(title, text) === 'income'
          ? 'income'
          : 'expense';
    return {
      transactionType: type,
      amount,
      walletName: 'BCA',
      note: this.buildNote(title, text),
      isMirrorEvent: this.detectMirrorEvent(title, text),
      fingerprint: this.buildFingerprint(app, type, amount),
    };
  }
}
