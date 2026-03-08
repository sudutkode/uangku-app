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

    const isIncoming = /menerima|masuk|kredit|top.?up/i.test(text);

    // Transfer ke bank/ewallet lain: ada pola "GoPay • nomor" atau "BCA • nomor"
    const isTransferToWallet =
      /\b(GoPay|OVO|DANA|BCA|Mandiri|BNI|BRI|SeaBank|Jago|ShopeePay|LinkAja)\b\s*[•·]\s*\d+/i.test(
        text,
      );

    // Payment ke merchant: "Kamu telah membayar ke [nama merchant]"
    // Nomor tujuannya adalah nomor terminal/merchant (bukan rekening bank)
    const isMerchantPayment = /membayar ke|mengirimkan uang/i.test(text);

    // Transfer biasa antar bank (ada kata transfer eksplisit)
    const isExplicitTransfer = /melakukan transfer|transfer uang/i.test(text);

    let transactionType: 'income' | 'expense' | 'transfer';
    if (isIncoming) {
      transactionType = 'income';
    } else if (isTransferToWallet || isExplicitTransfer) {
      transactionType = 'transfer';
    } else if (isMerchantPayment) {
      transactionType = 'expense'; // bayar merchant = pengeluaran
    } else {
      transactionType = 'expense';
    }

    // Extract nama merchant/tujuan dari subject
    // "Kamu telah membayar ke Dadar Beredar, Cimahi"
    const merchantFromSubject = this.extractMerchant(input.subject, [
      /membayar ke\s+(.+)/i,
    ]);

    const merchantFromBody = this.extractMerchant(text, [
      /\bKe\b\s*\n\s*([^\n•\d]+)/i,
    ]);

    const merchant = merchantFromSubject ?? merchantFromBody;

    // Suggest category berdasarkan nama merchant
    let categoryName: string | undefined;
    if (transactionType === 'expense') {
      categoryName = this.suggestCategoryFromMerchant(merchant ?? '');
    } else if (transactionType === 'transfer') {
      categoryName = 'Bank Transfer';
    }

    // Destination wallet hanya untuk transfer ke bank/ewallet
    let destinationWalletName: string | undefined;
    if (transactionType === 'transfer') {
      destinationWalletName = this.extractDestinationWallet(text);
    }

    return this.buildResult(input, amount, transactionType, {
      merchant,
      walletName: 'Jago',
      destinationWalletName,
      categoryName,
    });
  }

  private extractDestinationWallet(text: string): string | undefined {
    // "GoPay • 081511791947"
    const walletLineMatch =
      /\b(GoPay|OVO|DANA|BCA|Mandiri|BNI|BRI|SeaBank|Jago|ShopeePay|LinkAja|Flip)\b\s*[•·]\s*\d+/i.exec(
        text,
      );
    if (walletLineMatch?.[1]) {
      return this.normalizeWalletName(walletLineMatch[1]);
    }

    const bankMatch =
      /(?:bank tujuan|bank penerima)\s*[:\n]\s*([^\n•\d]+)/i.exec(text);
    if (bankMatch?.[1]) {
      return this.normalizeWalletName(bankMatch[1].trim());
    }

    return undefined;
  }

  private suggestCategoryFromMerchant(merchant: string): string {
    if (
      /resto|makan|food|warung|cafe|kafe|kopi|coffee|dadar|sate|bakso|mie|nasi|ayam|pizza|burger|runchise|dahankopi/i.test(
        merchant,
      )
    ) {
      return 'Food';
    }
    if (/grab|gojek|taxi|ojek|transport/i.test(merchant)) {
      return 'Transportation';
    }
    if (/apotek|pharmacy|klinik|rumah sakit|dokter/i.test(merchant)) {
      return 'Health';
    }
    if (/alfamart|indomaret|supermarket|minimarket/i.test(merchant)) {
      return 'Shopping';
    }
    return 'Food'; // default expense Jago = bayar makan
  }
}
