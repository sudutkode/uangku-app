const REGEX = {
  currency: /(?:rp\.?|idr)\s*([\d.,]+)/i,
  keywordAmount: /(?:sebesar|senilai)\s+(?:rp\.?\s*)?([\d.,]+)/i,
  thousand: /\b\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?\b/,
  otp: /\botp\b|kode verifikasi|verification code|\bkode\b.{0,10}\d{4,8}/,
  login: /login baru|masuk dari|perangkat baru|new (login|sign.?in|device)/,
};

const INCOME_PATTERNS: RegExp[] = [
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

export const TransactionParser = {
  normalizeAmount(raw: string): number | null {
    let str = raw.trim();
    str = str.replace(/[.,]\d{2}$/, "");
    str = str.replace(/[.,]/g, "");
    const value = parseInt(str, 10);
    return isNaN(value) || value <= 0 ? null : value;
  },

  extractAmount(text: string): number | null {
    const rp = text.match(REGEX.currency);
    if (rp) return this.normalizeAmount(rp[1]);

    const kw = text.match(REGEX.keywordAmount);
    if (kw) return this.normalizeAmount(kw[1]);

    const th = text.match(REGEX.thousand);
    if (th) return this.normalizeAmount(th[0]);

    return null;
  },

  detectType(title: string, text: string): number {
    const combined = `${title} ${text}`.toLowerCase();
    return INCOME_PATTERNS.some((r) => r.test(combined)) ? 1 : 2;
  },

  isNonTransaction(combined: string): boolean {
    const lower = combined.toLowerCase();

    const hasAmount =
      REGEX.currency.test(lower) ||
      REGEX.keywordAmount.test(lower) ||
      REGEX.thousand.test(lower);

    if (!hasAmount) return true;
    if (REGEX.otp.test(lower)) return true;
    if (REGEX.login.test(lower)) return true;

    return false;
  },
};
