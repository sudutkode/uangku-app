import { Injectable } from '@nestjs/common';
import { SyncNotificationDto } from '../../features/notifications/dto/sync-notification.dto';
import {
  BaseNotificationParser,
  ParsedNotification,
} from './base-notification.parser';

/**
 * Parser for SeaBank Indonesia
 * Real package name: id.co.bankbkemobile.digitalbank
 *
 * Real patterns observed (from device):
 *
 *   EXPENSE (QRIS payment):
 *     title: "Pembayaran QRIS berhasil"
 *     text:  "Pembayaran QRIS untuk RM LUBUK RAYA sebesar 14.000 telah berhasil."
 *     ⚠️  No "Rp" prefix — uses "sebesar 14.000"
 *
 *   OUTGOING TRANSFER (legitimate):
 *     title: "Realtime Transfer"
 *     text:  "Kamu baru melakukan transfer real-time senilai Rp15.000 pada 20 Mar 2026 00:07.
 *             Jika kamu tidak melakukan ini, segera hubungi 1500130."
 *     ⚠️  "segera hubungi 1500130" is a STANDARD FOOTER on all SeaBank notifications,
 *         NOT a fraud signal. Only filter when "tidak melakukan ini" appears WITHOUT
 *         a prior "Kamu baru melakukan" — meaning the user is the one being warned,
 *         not the one who initiated it.
 */
@Injectable()
export class SeabankNotificationParser extends BaseNotificationParser {
  canParse(app: string): boolean {
    return /bankbkemobile|seabank|sea\.bank/i.test(app);
  }

  parse(dto: SyncNotificationDto): ParsedNotification | null {
    const { title, text, app } = dto;
    const combined = `${title} ${text}`;

    const amount = this.extractAmount(combined);
    if (!amount) return null;

    const type = this.detectType(title, text);
    return {
      transactionType: type,
      amount,
      walletName: 'SeaBank',
      categoryName: this.guessCategory(type, title, text),
      note: this.buildNote(title, text),
      isMirrorEvent: this.detectMirrorEvent(title, text),
      fingerprint: this.buildFingerprint(app, type, amount, title, text),
    };
  }
}
