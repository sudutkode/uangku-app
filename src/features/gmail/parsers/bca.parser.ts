import { Injectable } from '@nestjs/common';
import {
  BaseBankParser,
  ParserInput,
  ParsedTransaction,
} from './base-bank.parser';

@Injectable()
export class BcaParser extends BaseBankParser {
  readonly sourceName = 'BCA';
  readonly senderPatterns = [
    /notifikasi@klikbca\.com/,
    /noreply@mybca\.com/,
    /no-reply@mybca\.com/,
    /notification@klikbca\.com/,
  ];

  parse(input: ParserInput): ParsedTransaction | null {
    const text = `${input.subject} ${input.body} ${input.snippet}`;
    const amount = this.extractAmount(text);
    if (!amount) return null;

    const isIncoming = /kredit|credit|masuk|diterima|menerima/i.test(text);
    const isTransfer = /transfer|debit|pemindahbukuan|pindah buku/i.test(text);

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
      // BCA transfer: cari bank tujuan
      const destMatch = /(?:bank tujuan|ke bank)\s*[:\n]?\s*([^\n•\d]+)/i.exec(
        text,
      );
      if (destMatch?.[1]) {
        destinationWalletName = this.normalizeWalletName(destMatch[1].trim());
      }
    }

    const categoryName =
      transactionType === 'transfer' ? 'Bank Transfer' : undefined;

    return this.buildResult(input, amount, transactionType, {
      merchant,
      walletName: 'BCA',
      destinationWalletName,
      categoryName,
    });
  }
}
