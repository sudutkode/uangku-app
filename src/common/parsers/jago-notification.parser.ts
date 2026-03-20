import { Injectable } from '@nestjs/common';
import { SyncNotificationDto } from '../../features/notifications/dto/sync-notification.dto';
import {
  BaseNotificationParser,
  ParsedNotification,
} from './base-notification.parser';

/**
 * Parser for Bank Jago (com.jago.app)
 *
 * Real patterns (confirmed from device):
 *
 *   OUTGOING to external person — recorded as EXPENSE (not transfer):
 *     text: "Kamu telah melakukan transfer Rp10.000 ke TONDIKI ANDIKA GURNING.
 *            Butuh bantuan? Silakan Tanya Jago di 1500 746."
 *     → No destination wallet info → downgrade to expense
 *
 *   OUTGOING to own Kantong — recorded as TRANSFER:
 *     text: "Transfer Rp200.000 ke Kantong Tabungan berhasil"
 *     → Has destination Kantong → real transfer with destinationWalletName
 *
 *   INCOMING (mirror event):
 *     text: "TONDIKI ANDIKA GURNING telah mengirim Rp10.000 ke kamu.
 *            Butuh bantuan? Silakan Tanya Jago di 1500 746."
 *     → Income, isMirrorEvent: true
 */
@Injectable()
export class JagoNotificationParser extends BaseNotificationParser {
  canParse(app: string): boolean {
    return /jago/i.test(app);
  }

  parse(dto: SyncNotificationDto): ParsedNotification | null {
    const { title, text, app } = dto;
    const combined = `${title} ${text}`;

    const amount = this.extractAmount(combined);
    if (!amount) return null;

    const isMirror = this.detectMirrorEvent(title, text);

    // Extract source Kantong if mentioned
    const kantongMatch = combined.match(
      /(?:dari|di)\s+Kantong\s+([A-Za-z\s]+?)(?:\s+berhasil|\.|,|$)/i,
    );
    const walletName = kantongMatch
      ? `Jago - ${kantongMatch[1].trim()}`
      : 'Jago';

    // Check if this is a transfer to another Kantong (internal)
    const destKantongMatch = text.match(
      /ke\s+Kantong\s+([A-Za-z\s]+?)(?:\s+berhasil|\.|,|$)/i,
    );

    let transactionType = this.detectType(title, text);
    let destinationWalletName: string | undefined;

    if (transactionType === 'transfer') {
      if (destKantongMatch) {
        // Transfer to another internal Kantong — keep as transfer
        destinationWalletName = `Jago - ${destKantongMatch[1].trim()}`;
      } else {
        // Transfer to external person/bank (e.g. "ke TONDIKI ANDIKA GURNING")
        // We don't know the destination wallet → downgrade to expense
        transactionType = 'expense';
      }
    }

    return {
      transactionType,
      amount,
      walletName,
      destinationWalletName,
      note: this.buildNote(title, text),
      isMirrorEvent: isMirror,
      fingerprint: this.buildFingerprint(app, transactionType, amount),
    };
  }
}
