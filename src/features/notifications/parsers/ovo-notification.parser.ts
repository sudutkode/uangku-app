import { Injectable } from '@nestjs/common';
import {
  BaseNotificationParser,
  ParsedNotification,
} from './base-notification.parser';
import { SyncNotificationDto } from '../dto/sync-notification.dto';

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
    return app === 'ovo.id';
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
      note: this.buildNote(title, text),
      isMirrorEvent: this.detectMirrorEvent(title, text),
      fingerprint: this.buildFingerprint(app, type, amount),
    };
  }
}
