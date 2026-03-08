import { Injectable } from '@nestjs/common';
import {
  BaseBankParser,
  ParserInput,
  ParsedTransaction,
} from './base-bank.parser';

@Injectable()
export class BniParser extends BaseBankParser {
  readonly sourceName = 'BNI';
  readonly senderPatterns = [
    /bni@bni\.co\.id/,
    /noreply@bni\.co\.id/,
    /no-reply@bni\.co\.id/,
    /notifikasi@bni\.co\.id/,
  ];

  parse(input: ParserInput): ParsedTransaction | null {
    const text = `${input.subject} ${input.body} ${input.snippet}`;
    const amount = this.extractAmount(text);
    if (!amount) return null;

    const isIncoming = /kredit|credit|masuk|diterima/i.test(text);
    const isTransfer = /transfer|debit|pemindahbukuan/i.test(text);

    const transactionType = isIncoming
      ? 'income'
      : isTransfer
        ? 'transfer'
        : 'expense';

    const merchant = this.extractMerchant(text, [
      /(?:kepada|ke|tujuan)\s*[:\n]?\s*([^\n]+)/i,
      /nama\s+(?:tujuan|penerima)\s*[:\n]\s*([^\n]+)/i,
    ]);

    let destinationWalletName: string | undefined;
    if (transactionType === 'transfer') {
      const destMatch = /(?:bank tujuan|ke bank)\s*[:\n]?\s*([^\n•\d]+)/i.exec(
        text,
      );
      if (destMatch?.[1])
        destinationWalletName = this.normalizeWalletName(destMatch[1].trim());
    }

    return this.buildResult(input, amount, transactionType, {
      merchant,
      walletName: 'BNI',
      destinationWalletName,
      categoryName:
        transactionType === 'transfer' ? 'Bank Transfer' : undefined,
    });
  }
}
