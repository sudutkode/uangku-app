import { Injectable } from '@nestjs/common';
import {
  BaseBankParser,
  ParserInput,
  ParsedTransaction,
} from './base-bank.parser';

@Injectable()
export class JagoParser extends BaseBankParser {
  readonly sourceName = 'Jago';
  readonly senderPatterns = [
    /noreply@jago\.com/,
    /no-reply@jago\.com/,
    /hello@jago\.com/,
    /notification@jago\.com/,
    /tanya@jago\.com/,
  ];

  parse(input: ParserInput): ParsedTransaction | null {
    const text = `${input.subject} ${input.body} ${input.snippet}`;
    const amount = this.extractAmount(text);
    if (!amount) return null;

    const isTransferOut =
      /melakukan transfer|transfer uang|kamu.*transfer/i.test(text);
    const isReceived = this.isIncome(text);

    const transactionType = isReceived
      ? 'income'
      : isTransferOut || this.isTransfer(text)
        ? 'transfer'
        : 'expense';

    const merchant = this.extractMerchant(text, [
      /\bKe\b\s*\n\s*([^\n]+)/i,
      /kepada\s+(.+?)(?:\s+Rp|\s+senilai|\n|$)/i,
    ]);

    let destinationWalletName: string | undefined;
    if (transactionType === 'transfer') {
      destinationWalletName = this.extractDestinationWallet(text);
    }

    return this.buildResult(input, amount, transactionType, {
      merchant,
      walletName: 'Jago',
      destinationWalletName,
    });
  }

  private extractDestinationWallet(text: string): string | undefined {
    /**
     * Format email Jago:
     * "Ke
     *  TONDIKI ANDIKA GURNING
     *  GoPay • 081511791947"
     *
     * Kita cari baris yang berisi nama bank/ewallet diikuti "•" dan nomor
     * Ini lebih reliable daripada cari setelah "Ke"
     */
    const walletLineMatch =
      /\b(GoPay|OVO|DANA|BCA|Mandiri|BNI|BRI|SeaBank|Jago|ShopeePay|LinkAja|Flip)\b\s*[•·]\s*\d+/i.exec(
        text,
      );
    if (walletLineMatch?.[1]) {
      return this.normalizeWalletName(walletLineMatch[1]);
    }

    // Fallback: "Bank Tujuan: BCA" atau "Bank Penerima: BCA"
    const bankMatch =
      /(?:bank tujuan|bank penerima)\s*[:\n]\s*([^\n•\d]+)/i.exec(text);
    if (bankMatch?.[1]) {
      return this.normalizeWalletName(bankMatch[1].trim());
    }

    return undefined;
  }
}
