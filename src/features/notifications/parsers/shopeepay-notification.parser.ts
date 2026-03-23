import { Injectable } from '@nestjs/common';
import { SyncNotificationDto } from '../dto/sync-notification.dto';
import {
  BaseNotificationParser,
  ParsedNotification,
} from './base-notification.parser';

/**
 * Parser for ShopeePay (com.shopee.id)
 *
 * Real patterns:
 *   INCOME:  "Top Up ShopeePay Rp100.000 berhasil"
 *   INCOME:  "ShopeePay: Rp25.000 ShopeePay Coins diterima"
 *   EXPENSE: "Pembayaran Rp150.000 ke Shopee berhasil menggunakan ShopeePay"
 *   EXPENSE: "Kamu membayar Rp60.000 ke Indomaret dengan ShopeePay"
 */
@Injectable()
export class ShopeeNotificationParser extends BaseNotificationParser {
  canParse(app: string): boolean {
    return app === 'com.shopeepay.id';
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
        walletName: 'ShopeePay',
        categoryName: 'Top Up',
        note: this.buildNote(title, text),
        fingerprint: this.buildFingerprint(app, 'income', amount),
      };
    }
    const type = this.detectType(title, text);
    return {
      transactionType: type,
      amount,
      walletName: 'ShopeePay',
      note: this.buildNote(title, text),
      isMirrorEvent: this.detectMirrorEvent(title, text),
      fingerprint: this.buildFingerprint(app, type, amount),
    };
  }
}
