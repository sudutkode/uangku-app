import { Injectable } from '@nestjs/common';
import {
  BaseBankParser,
  ParserInput,
  ParsedTransaction,
} from './base-bank.parser';
import { normalizeIndonesianNumber } from './amount.parser';

@Injectable()
export class FlipParser extends BaseBankParser {
  readonly sourceName = 'Flip';
  readonly senderPatterns = [
    /no-reply@flip\.id/,
    /noreply@flip\.id/,
    /info@flip\.id/,
  ];

  parse(input: ParserInput): ParsedTransaction | null {
    const text = `${input.subject} ${input.body} ${input.snippet}`;

    // Tolak email pending — user belum transfer ke Flip
    const isPending =
      /informasi transaksi|lakukan transfer ke rekening flip|konfirmasi transfer|sudah transfer\?/i.test(
        text,
      );
    if (isPending) return null;

    // Hanya proses email konfirmasi berhasil
    const isConfirmed =
      /transfer.*berhasil|berhasil diproses|bukti transfer/i.test(text);
    if (!isConfirmed) return null;

    const amount = this.extractFlipAmount(text);
    if (!amount) return null;

    const merchant = this.extractMerchant(text, [
      /transfer ke\s+(.+?)\s+berhasil/i,
      /nama tujuan\s*\n?\s*([^\n]+)/i,
      /nama penerima\s*\n?\s*([^\n]+)/i,
    ]);

    // Detect bank tujuan dari email Flip
    // "Bank Tujuan\nJago/Artos" atau "Bank Tujuan\nBCA"
    let destinationWalletName: string | undefined;
    const bankTujuanMatch = /bank tujuan\s*\n?\s*([^\n]+)/i.exec(text);
    if (bankTujuanMatch?.[1]) {
      destinationWalletName = this.normalizeWalletName(
        bankTujuanMatch[1].trim(),
      );
    }

    return this.buildResult(input, amount, 'transfer', {
      merchant,
      walletName: 'Flip',
      destinationWalletName,
      categoryName: 'Bank Transfer',
    });
  }

  private extractFlipAmount(text: string): number | null {
    // Ambil "Nominal" pertama — di email konfirmasi hanya ada satu
    const nominalMatch = /nominal\s*\n?\s*(?:Rp\.?|IDR)?\s*([\d.,]+)/i.exec(
      text,
    );
    if (nominalMatch) {
      const amount = normalizeIndonesianNumber(nominalMatch[1]);
      if (amount && amount >= 100) return amount;
    }
    return this.extractAmount(text);
  }
}
