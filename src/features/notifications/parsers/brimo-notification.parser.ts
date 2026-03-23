import { Injectable } from '@nestjs/common';
import { SyncNotificationDto } from '../dto/sync-notification.dto';
import {
  BaseNotificationParser,
  ParsedNotification,
} from './base-notification.parser';

/**
 * Parser for BRI / BRImo (id.co.bri.brimo)
 *
 * Real patterns:
 *   INCOME:  "Dana masuk Rp500.000 dari ANDI WIJAYA"
 *   EXPENSE: "Transaksi berhasil Rp100.000 ke PLN"
 *   TRANSFER:"Transfer ke 085xxxxxxx BRI Rp200.000 berhasil"
 */
@Injectable()
export class BrimoNotificationParser extends BaseNotificationParser {
  canParse(app: string): boolean {
    return app === 'id.co.bri.brimo';
  }
  parse(dto: SyncNotificationDto): ParsedNotification | null {
    const { title, text, app } = dto;
    const amount = this.extractAmount(`${title} ${text}`);
    if (!amount) return null;
    const type = this.detectType(title, text);
    return {
      transactionType: type,
      amount,
      walletName: 'BRI',
      note: this.buildNote(title, text),
      isMirrorEvent: this.detectMirrorEvent(title, text),
      fingerprint: this.buildFingerprint(app, type, amount),
    };
  }
}
