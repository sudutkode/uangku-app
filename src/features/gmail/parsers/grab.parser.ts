import { Injectable } from '@nestjs/common';
import {
  BaseBankParser,
  ParserInput,
  ParsedTransaction,
} from './base-bank.parser';
import { normalizeIndonesianNumber } from './amount.parser';

/**
 * Email Grab: receipt perjalanan GrabBike/GrabCar/GrabFood
 * Format: English
 *
 * Contoh subject: "GrabBike - Hope you enjoyed your ride!"
 * Total Paid: RP 20.000
 */
@Injectable()
export class GrabParser extends BaseBankParser {
  readonly sourceName = 'Grab';
  readonly senderPatterns = [
    /no-reply@grab\.com/,
    /noreply@grab\.com/,
    /receipt@grab\.com/,
    /notification@grab\.com/,
  ];

  parse(input: ParserInput): ParsedTransaction | null {
    const text = `${input.subject} ${input.body} ${input.snippet}`;

    const isReceipt =
      /total paid|your ride|your trip|your order|booking id|receipt/i.test(
        text,
      );
    if (!isReceipt) return null;

    const amount = this.extractGrabAmount(text);
    if (!amount) return null;

    const walletName = this.extractWalletFromGrab(text);

    const serviceMatch =
      /\b(Grab(?:Bike|Car|Food|Mart|Express|Courier)?)\b/i.exec(input.subject);
    const service = serviceMatch?.[1] ?? 'Grab';
    const merchant = service;

    // Tentukan category berdasarkan jenis layanan Grab
    const categoryName = this.suggestGrabCategory(service);

    return this.buildResult(input, amount, 'expense', {
      merchant,
      walletName,
      categoryName,
    });
  }

  private suggestGrabCategory(service: string): string {
    if (/GrabBike|GrabCar|GrabExpress|GrabCourier/i.test(service)) {
      return 'Transportation';
    }
    if (/GrabFood|GrabMart/i.test(service)) {
      return 'Food';
    }
    return 'Transportation'; // default Grab
  }

  private extractGrabAmount(text: string): number | null {
    const patterns = [
      // "Total Paid\nRP 20.000" atau "Total Paid\n14.500"
      /total paid\s*\n\s*(?:RP|Rp|IDR)?\.?\s*([\d.,]+)/i,
      // "Total Paid RP 20.000" (satu baris)
      /total paid\s+(?:RP|Rp|IDR)?\.?\s*([\d.,]+)/i,
    ];

    for (const pattern of patterns) {
      const match = pattern.exec(text);
      if (match) {
        const amount = normalizeIndonesianNumber(match[1]);
        if (amount && amount >= 100) return amount;
      }
    }

    // Fallback ke extractor biasa
    return this.extractAmount(text);
  }

  private extractWalletFromGrab(text: string): string {
    // English: "Paid by\nOVO\n14.500"
    // Indonesia: "Dibayar dengan\nOVO\n5000"
    const match =
      /(?:paid by|dibayar dengan)\s*\n?\s*([A-Za-z\s]+?)(?:\n|[\d]|$)/i.exec(
        text,
      );
    if (match?.[1]) {
      return this.normalizeWalletName(match[1].trim());
    }
    return 'Cash';
  }
}
