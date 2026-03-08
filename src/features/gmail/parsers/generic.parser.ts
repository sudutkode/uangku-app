import { Injectable } from '@nestjs/common';
import {
  BaseBankParser,
  ParserInput,
  ParsedTransaction,
} from './base-bank.parser';

@Injectable()
export class GenericBankParser extends BaseBankParser {
  readonly sourceName = 'Bank';
  readonly senderPatterns = [];

  // Generic tidak punya canParse — dipanggil manual sebagai fallback
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canParse(_from: string): boolean {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  parse(_input: ParserInput): ParsedTransaction | null {
    return null;
  }

  tryParseFallback(input: ParserInput): ParsedTransaction | null {
    const text = `${input.subject} ${input.body} ${input.snippet}`;

    // Hanya proses kalau subject mengandung keyword transaksi
    const isTransaction =
      /transaksi|pembayaran berhasil|transfer berhasil|payment success/i.test(
        input.subject,
      );
    if (!isTransaction) return null;

    const amount = this.extractAmount(text);
    if (!amount) return null;

    const isIncoming = /masuk|diterima|kredit|credit|received/i.test(text);
    const isTransfer = /transfer|kirim/i.test(text);

    const transactionType = isIncoming
      ? 'income'
      : isTransfer
        ? 'transfer'
        : 'expense';

    return this.buildResult(input, amount, transactionType, {
      confidence: 'low',
    });
  }
}
