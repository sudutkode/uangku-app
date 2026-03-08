import { Injectable } from '@nestjs/common';
import {
  BaseBankParser,
  ParserInput,
  ParsedTransaction,
} from './base-bank.parser';

@Injectable()
export class DanaParser extends BaseBankParser {
  readonly sourceName = 'DANA';
  readonly senderPatterns = [
    /noreply@dana\.id/,
    /no-reply@dana\.id/,
    /notification@dana\.id/,
  ];

  parse(input: ParserInput): ParsedTransaction | null {
    const text = `${input.subject} ${input.body} ${input.snippet}`;
    const amount = this.extractAmount(text);
    if (!amount) return null;

    const isIncoming = /masuk|diterima|top.?up|isi saldo|refund|cashback/i.test(
      text,
    );
    const isTransfer = /transfer|kirim/i.test(text);

    const transactionType = isIncoming
      ? 'income'
      : isTransfer
        ? 'transfer'
        : 'expense';

    const merchant = this.extractMerchant(text, [
      /pembayaran ke\s+(.+?)(?:\s+Rp|\n|$)/i,
      /transaksi di\s+(.+?)(?:\s+Rp|\n|$)/i,
      /nama merchant\s*[:\n]\s*([^\n]+)/i,
    ]);

    let destinationWalletName: string | undefined;
    if (transactionType === 'transfer') {
      const destMatch =
        /ke\s+(GoPay|OVO|DANA|BCA|Mandiri|BNI|BRI|SeaBank|Jago)\b/i.exec(text);
      if (destMatch?.[1])
        destinationWalletName = this.normalizeWalletName(destMatch[1]);
    }

    return this.buildResult(input, amount, transactionType, {
      merchant,
      walletName: 'DANA',
      destinationWalletName,
    });
  }
}
