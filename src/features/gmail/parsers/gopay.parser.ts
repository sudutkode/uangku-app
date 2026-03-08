import { Injectable } from '@nestjs/common';
import {
  BaseBankParser,
  ParserInput,
  ParsedTransaction,
} from './base-bank.parser';

@Injectable()
export class GopayParser extends BaseBankParser {
  readonly sourceName = 'GoPay';
  readonly senderPatterns = [
    /noreply@gopay\.co\.id/,
    /no-reply@gopay\.co\.id/,
    /noreply@gojek\.com/,
    /no-reply@gojek\.com/,
  ];

  parse(input: ParserInput): ParsedTransaction | null {
    const text = `${input.subject} ${input.body} ${input.snippet}`;
    const amount = this.extractAmount(text);
    if (!amount) return null;

    const isIncoming =
      /masuk|diterima|menerima|kredit|top.?up|isi saldo|refund|cashback|kamu menerima/i.test(
        text,
      );
    const isTransferOut =
      /transfer|kirim uang|kamu mengirim|pembayaran ke/i.test(text);

    const transactionType = isIncoming
      ? 'income'
      : isTransferOut
        ? 'transfer'
        : 'expense';

    // GoPay expense = pembayaran merchant
    const categoryName = transactionType === 'expense' ? 'Food' : undefined;

    const merchant = this.extractMerchant(text, [
      /pembayaran ke\s+(.+?)(?:\s+Rp|\n|$)/i,
      /transaksi di\s+(.+?)(?:\s+Rp|\n|$)/i,
      /kamu membayar\s+(.+?)(?:\s+Rp|\n|$)/i,
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
      walletName: 'GoPay',
      destinationWalletName,
      categoryName,
    });
  }
}
