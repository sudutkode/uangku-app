import { extractAmount } from './amount.parser';

// Hasil parse satu email transaksi
export interface ParsedTransaction {
  subject: string;
  date: string;
  amount: number;
  transactionType: 'income' | 'expense' | 'transfer';
  merchant?: string;
  source: string;
  walletName?: string;
  destinationWalletName?: string;
  categoryName?: string; // ← BARU: hint category spesifik
  rawSnippet: string;
  confidence: 'high' | 'medium' | 'low';
}

// Input yang diterima setiap parser
export interface ParserInput {
  subject: string; // subject email
  from: string; // header "From", contoh: "GoPay <noreply@gopay.co.id>"
  date: string; // header "Date" email
  body: string; // isi email dalam plain text
  snippet: string; // cuplikan pendek dari Gmail API (~100 karakter)
}

/**
 * Base class untuk semua parser bank.
 *
 * Pola desain: Template Method
 * - Base class menyediakan helper methods (extractAmount, isIncome, dll)
 * - Setiap bank turunan implement parse() dan senderPatterns sendiri
 * - Mudah menambah bank baru: cukup buat file baru extend BaseBankParser
 */
export abstract class BaseBankParser {
  abstract readonly sourceName: string;
  abstract readonly senderPatterns: RegExp[];

  // Cek apakah parser ini cocok untuk email dari pengirim tertentu
  canParse(from: string): boolean {
    return this.senderPatterns.some((p) => p.test(from.toLowerCase()));
  }

  // Setiap bank turunan implement logika parse-nya sendiri
  abstract parse(input: ParserInput): ParsedTransaction | null;

  // ─── Helper Methods ────────────────────────────────────────────────────

  protected extractAmount(text: string): number | null {
    return extractAmount(text);
  }

  protected extractMerchant(
    text: string,
    patterns: RegExp[],
  ): string | undefined {
    for (const pattern of patterns) {
      pattern.lastIndex = 0;
      const match = pattern.exec(text);
      if (match?.[1]) {
        return match[1]
          .trim()
          .replace(/\s+/g, ' ')
          .substring(0, 60) // batasi panjang nama merchant
          .replace(/[.,;:]+$/, ''); // hapus tanda baca trailing
      }
    }
    return undefined;
  }

  // Deteksi uang masuk
  protected isIncome(text: string): boolean {
    return /\b(top.?up|topup|masuk|diterima|kredit|credit|\bcr\b|menerima|refund|cashback|kembali|kembalian)\b/i.test(
      text,
    );
  }

  // Deteksi uang keluar
  protected isExpense(text: string): boolean {
    return /\b(keluar|terdebet|debet|debit|\bdb\b|pembayaran|bayar|pengeluaran|belanja)\b/i.test(
      text,
    );
  }

  // Deteksi transfer
  protected isTransfer(text: string): boolean {
    return /\b(transfer|kirim uang|send money)\b/i.test(text);
  }

  protected normalizeWalletName(raw: string): string {
    const map: Record<string, string> = {
      gopay: 'GoPay',
      'go-pay': 'GoPay',
      ovo: 'OVO',
      dana: 'DANA',
      bca: 'BCA',
      'bank bca': 'BCA',
      'klik bca': 'BCA',
      mandiri: 'Mandiri',
      'bank mandiri': 'Mandiri',
      bni: 'BNI',
      'bank bni': 'BNI',
      bri: 'BRI',
      'bank bri': 'BRI',
      seabank: 'SeaBank',
      'sea bank': 'SeaBank',
      jago: 'Jago',
      'bank jago': 'Jago',
      'jago/artos': 'Jago',
      shopeepay: 'ShopeePay',
      linkaja: 'LinkAja',
      'link aja': 'LinkAja',
      flip: 'Flip',
      cash: 'Cash',
    };

    const normalized = map[raw.toLowerCase().trim()];
    if (normalized) return normalized;

    return raw.trim().replace(/\b\w/g, (c) => c.toUpperCase());
  }

  protected buildResult(
    input: ParserInput,
    amount: number,
    transactionType: 'income' | 'expense' | 'transfer',
    options?: {
      merchant?: string;
      walletName?: string;
      destinationWalletName?: string;
      categoryName?: string; // ← BARU
      confidence?: 'high' | 'medium' | 'low';
    },
  ): ParsedTransaction {
    return {
      subject: input.subject,
      date: new Date(input.date).toISOString(),
      amount,
      transactionType,
      merchant: options?.merchant,
      walletName: options?.walletName
        ? this.normalizeWalletName(options.walletName)
        : this.sourceName,
      destinationWalletName: options?.destinationWalletName
        ? this.normalizeWalletName(options.destinationWalletName)
        : undefined,
      categoryName: options?.categoryName,
      source: this.sourceName,
      rawSnippet: input.snippet,
      confidence: options?.confidence ?? 'high',
    };
  }
}
