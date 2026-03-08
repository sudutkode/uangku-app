import { Injectable } from '@nestjs/common';
import {
  BaseBankParser,
  ParserInput,
  ParsedTransaction,
} from './base-bank.parser';

@Injectable()
export class SeabankParser extends BaseBankParser {
  readonly sourceName = 'SeaBank';
  readonly senderPatterns = [
    /noreply@seabank\.co\.id/,
    /no-reply@seabank\.co\.id/,
    /notification@seabank\.co\.id/,
  ];

  parse(input: ParserInput): ParsedTransaction | null {
    const text = `${input.subject} ${input.body} ${input.snippet}`;
    const amount = this.extractAmount(text);
    if (!amount) return null;

    const isIncoming = /masuk|diterima|kredit|top.?up/i.test(text);
    const isTransfer = /transfer|kirim/i.test(text);

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
      const destMatch =
        /(?:bank tujuan|ke bank|tujuan)\s*[:\n]?\s*([^\n•\d]+)/i.exec(text);
      if (destMatch?.[1])
        destinationWalletName = this.normalizeWalletName(destMatch[1].trim());
    }

    return this.buildResult(input, amount, transactionType, {
      merchant,
      walletName: 'SeaBank',
      destinationWalletName,
      categoryName:
        transactionType === 'transfer' ? 'Bank Transfer' : undefined,
    });
  }
}
