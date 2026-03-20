import { SyncNotificationDto } from '../../features/notifications/dto/sync-notification.dto';

export interface ParsedNotification {
  transactionType: 'income' | 'expense' | 'transfer';
  amount: number;
  walletName: string;
  destinationWalletName?: string;
  categoryName?: string;
  /**
   * Raw notification text stored as a transaction note.
   * Because we can't reliably determine the real category from a notification,
   * we store the original message so the user knows what triggered the record.
   */
  note?: string;
  fingerprint: string;
  isMirrorEvent?: boolean;
}

export abstract class BaseNotificationParser {
  abstract canParse(app: string): boolean;
  abstract parse(dto: SyncNotificationDto): ParsedNotification | null;

  // ─── Amount extraction ─────────────────────────────────────────────────────

  protected extractAmount(text: string): number | null {
    const informalMatch = text.match(
      /(\d+(?:[.,]\d+)?)\s*(ribu|rb|juta|jt|miliar)\b/i,
    );
    if (informalMatch) {
      const num = parseFloat(informalMatch[1].replace(',', '.'));
      const unit = informalMatch[2].toLowerCase();
      if (unit === 'ribu' || unit === 'rb') return Math.round(num * 1_000);
      if (unit === 'juta' || unit === 'jt') return Math.round(num * 1_000_000);
      if (unit === 'miliar') return Math.round(num * 1_000_000_000);
    }

    const prefixMatch = text.match(/(?:Rp\.?|IDR)\s*([\d.,]+)/i);
    if (prefixMatch) return this.parseRupiahString(prefixMatch[1]);

    const sebesarMatch = text.match(/sebesar\s+([\d.,]+)/i);
    if (sebesarMatch) return this.parseRupiahString(sebesarMatch[1]);

    const senilaiMatch = text.match(/senilai\s+(?:Rp\.?|IDR)?\s*([\d.,]+)/i);
    if (senilaiMatch) return this.parseRupiahString(senilaiMatch[1]);

    const amountOfMatch = text.match(
      /(?:amount|total|value)\s+of\s+(?:Rp\.?|IDR)?\s*([\d.,]+)/i,
    );
    if (amountOfMatch) return this.parseRupiahString(amountOfMatch[1]);

    const bareMatch = text.match(/\b(\d{1,3}(?:\.\d{3})+)\b/);
    if (bareMatch) return this.parseRupiahString(bareMatch[1]);

    return null;
  }

  private parseRupiahString(raw: string): number | null {
    const withoutCents = raw.replace(/[.,]\d{2}$/, '');
    const digits = withoutCents.replace(/[.,]/g, '');
    const value = parseInt(digits, 10);
    return isNaN(value) || value === 0 ? null : value;
  }

  // ─── Transaction type detection ────────────────────────────────────────────

  protected detectType(
    title: string,
    text: string,
  ): 'income' | 'expense' | 'transfer' {
    const combined = `${title} ${text}`.toLowerCase();

    const outgoingTransferKw = [
      'telah melakukan transfer',
      'transfer ke',
      'kirim ke',
      'ke rekening',
      'ke rek ',
      'pemindahbukuan',
      'send to',
      'sent to',
      'transfer to',
      'you have transferred',
      'you transferred',
    ];
    if (outgoingTransferKw.some((kw) => combined.includes(kw)))
      return 'transfer';

    const incomePatterns = [
      /uang masuk/,
      /dana masuk/,
      /saldo (kamu )?bertambah/,
      /anda telah menerima/,
      /telah menerima/,
      /kamu menerima/,
      /telah mengirim.{0,30}ke kamu/,
      /transfer masuk/,
      /diterima/,
      /top.?up/,
      /isi saldo/,
      /tambah saldo/,
      /cashback/,
      /refund/,
      /pengembalian/,
      /hadiah|bonus|reward/,
      /you (have )?received/,
      /money received/,
      /has sent you/,
      /sent you/,
      /incoming (transfer|payment)/,
      /credited (to your|to)/,
      /deposit(ed)?/,
      /payment received/,
      /transfer in/,
      /added to (your )?account/,
      /top.?up (successful|berhasil)/,
    ];
    if (incomePatterns.some((rx) => rx.test(combined))) return 'income';

    return 'expense';
  }

  protected detectMirrorEvent(title: string, text: string): boolean {
    const combined = `${title} ${text}`.toLowerCase();
    return (
      /telah mengirim.{0,30}ke kamu/.test(combined) ||
      /has sent you/.test(combined) ||
      /sent you\s+(rp|idr|\d)/.test(combined)
    );
  }

  // ─── Category guessing ────────────────────────────────────────────────────

  /**
   * Tries to map the notification to a known category.
   * Returns 'Auto-Import' as the fallback — a dedicated category
   * seeded for all three transaction types specifically for this use case.
   */
  protected guessCategory(
    type: 'income' | 'expense' | 'transfer',
    title: string,
    text: string,
  ): string {
    if (type === 'transfer') return 'Auto-Import';

    const combined = `${title} ${text}`.toLowerCase();

    if (type === 'income') {
      if (/cashback|reward|hadiah|bonus|coin/.test(combined))
        return 'Cashback & Rewards';
      if (
        /gaji|salary|payroll|allowance|tunjangan|freelance|honorarium/.test(
          combined,
        )
      )
        return 'Salary';
      if (/refund|pengembalian|kembali|reversal/.test(combined))
        return 'Refund';
      if (/top.?up|isi saldo|reload/.test(combined)) return 'Top Up';
      return 'Auto-Import';
    }

    // Expense
    if (
      /makan|minum|nasi|bakso|warteg|pecel|mie |ayam|sate|gado|bubur|soto|rendang|martabak/.test(
        combined,
      )
    )
      return 'Food & Drink';
    if (
      /food|drink|resto|restoran|rumah makan|cafe|kafe|coffee|restaurant|eatery/.test(
        combined,
      )
    )
      return 'Food & Drink';
    if (
      /kfc|mcdonald|pizza|burger|starbucks|chatime|hokben|yoshinoya|solaria/.test(
        combined,
      )
    )
      return 'Food & Drink';
    if (/grab.?food|gofood|shopee.?food/.test(combined)) return 'Food & Drink';
    if (/qris/.test(combined)) return 'Food & Drink';
    if (/token|listrik|pln|electricity/.test(combined))
      return 'Bills & Utilities';
    if (/air pdam|pdam|water bill/.test(combined)) return 'Bills & Utilities';
    if (
      /telkom|internet|wifi|indihome|first media|myrepublic|biznet/.test(
        combined,
      )
    )
      return 'Bills & Utilities';
    if (/bpjs|insurance|asuransi/.test(combined)) return 'Bills & Utilities';
    if (/ gas |pgn|subscription/.test(combined)) return 'Bills & Utilities';
    if (
      /grab|gojek|ojek|gocar|taxi|blue.?bird|transjakarta|busway/.test(combined)
    )
      return 'Transport';
    if (/commuter|mrt|lrt|kereta|krl|kai/.test(combined)) return 'Transport';
    if (/ toll|parkir|parking|bensin|bbm|pertamina|shell|fuel/.test(combined))
      return 'Transport';
    if (
      /shopee|tokopedia|lazada|bukalapak|blibli|tiktok.?shop|zalora/.test(
        combined,
      )
    )
      return 'Shopping';
    if (
      /indomaret|alfamart|alfamidi|circle.?k|lawson|minimarket/.test(combined)
    )
      return 'Shopping';
    if (/supermarket|hypermart|carrefour|giant|hero|grocery/.test(combined))
      return 'Shopping';
    if (/dokter|doctor|apotek|pharmacy|obat|medicine/.test(combined))
      return 'Health';
    if (/klinik|clinic|hospital|rumah sakit|puskesmas/.test(combined))
      return 'Health';
    if (
      /netflix|spotify|youtube|disney|vidio|steam|game|bioskop|cinema/.test(
        combined,
      )
    )
      return 'Entertainment';
    if (/tarik tunai|withdraw|atm/.test(combined)) return 'Withdrawal';

    return 'Auto-Import';
  }

  // ─── Note builder ─────────────────────────────────────────────────────────

  /**
   * Builds a clean note from the notification content.
   * Strips boilerplate suffixes like Jago's "Butuh bantuan? Silakan Tanya Jago..."
   */
  protected buildNote(title: string, text: string): string {
    const boilerplate = /\.\s*Butuh bantuan\?.*$/i;
    const raw = `${title ? title + ' — ' : ''}${text}`;
    return raw.replace(boilerplate, '').replace(/\s+/g, ' ').trim();
  }

  // ─── Fingerprint ──────────────────────────────────────────────────────────

  protected buildFingerprint(
    app: string,
    type: string,
    amount: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    title: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    text: string,
  ): string {
    // Intentionally minimal — only app + type + amount.
    // Dedup is handled by the 2-minute time window in the service.
    // Including text/title caused false duplicates when the same
    // transaction amount recurred with identical notification text.
    return `${app}|${type}|${amount}`;
  }
}
