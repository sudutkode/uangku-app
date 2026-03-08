import { Injectable } from '@nestjs/common';
import {
  BaseBankParser,
  ParserInput,
  ParsedTransaction,
} from './base-bank.parser';

@Injectable()
export class OvoParser extends BaseBankParser {
  readonly sourceName = 'OVO';
  readonly senderPatterns = [
    /no-reply@ovo\.id/,
    /noreply@ovo\.id/,
    /noreply@ovo\.co\.id/,
    /no-reply@ovo\.co\.id/,
    /notification@ovo\.id/,
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

    // Dari email kamu: OVO QR Payment → merchant dari baris pertama body
    const merchant = this.extractMerchant(text, [
      // "Cinto Minang, Kebon Sirih\nPembayaran Berhasil"
      /^([^\n]+)\nPembayaran Berhasil/im,
      /nama toko\s*([^\n]+)/i,
      /pembayaran ke\s+(.+?)(?:\s+Rp|\n|$)/i,
    ]);

    // Coba detect category dari merchant name
    const categoryName = this.suggestCategory(merchant ?? '', transactionType);

    return this.buildResult(input, amount, transactionType, {
      merchant,
      walletName: 'OVO',
      categoryName,
    });
  }

  private suggestCategory(merchant: string, type: string): string | undefined {
    if (type !== 'expense') return undefined;
    if (
      /resto|makan|food|warung|cafe|kafe|minang|sate|bakso|mie|nasi|ayam|pizza|burger/i.test(
        merchant,
      )
    )
      return 'Food';
    if (/grab|gojek|taxi|transport|ojek/i.test(merchant))
      return 'Transportation';
    if (/apotek|pharmacy|klinik|rumah sakit|dokter/i.test(merchant))
      return 'Health';
    return undefined;
  }
}
