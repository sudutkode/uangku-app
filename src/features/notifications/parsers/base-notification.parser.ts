import { SyncNotificationDto } from '../dto/sync-notification.dto';

export interface ParsedNotification {
  transactionType: 'income' | 'expense';
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

  protected detectType(title: string, text: string): 'income' | 'expense' {
    const combined = `${title} ${text}`.toLowerCase();

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
      /menerima/,
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
  ): string {
    // Intentionally minimal — only app + type + amount.
    // Dedup is handled by the 2-minute time window in the service.
    // transaction amount recurred with identical notification text.
    return `${app}|${type}|${amount}`;
  }
}
