import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { User } from '../../database/entities/user.entity';
import { Transaction } from '../../database/entities/transaction.entity';
import { TransactionWallet } from '../../database/entities/transaction-wallet.entity';
import { Wallet } from '../../database/entities/wallet.entity';
import { TransactionCategory } from '../../database/entities/transaction-category.entity';
import { SyncNotificationDto } from './dto/sync-notification.dto';
import {
  BaseNotificationParser,
  ParsedNotification,
} from '../../common/parsers/base-notification.parser';
import { JagoNotificationParser } from '../../common/parsers/jago-notification.parser';
import { GopayNotificationParser } from '../../common/parsers/gopay-notification.parser';
import { SeabankNotificationParser } from '../../common/parsers/seabank-notification.parser';
import { OvoNotificationParser } from '../../common/parsers/ovo-notification.parser';
import { DanaNotificationParser } from '../../common/parsers/dana-notification.parser';
import { ShopeepayNotificationParser } from '../../common/parsers/shopeepay-notification.parser';
import { BcaNotificationParser } from '../../common/parsers/bca-notification.parser';
import { MandiriNotificationParser } from '../../common/parsers/mandiri-notification.parser';
import { BriNotificationParser } from '../../common/parsers/bri-notification.parser';
import { BniNotificationParser } from '../../common/parsers/bni-notification.parser';
import { LinkAjaNotificationParser } from '../../common/parsers/linkaja-notification.parser';
import {
  NOTIFICATION_CATEGORY_NAME,
  TRANSACTION_TYPE_ID,
} from '../../common/constants';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly parsers: BaseNotificationParser[];

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(TransactionCategory)
    private readonly categoryRepo: Repository<TransactionCategory>,

    jagoParser: JagoNotificationParser,
    gopayParser: GopayNotificationParser,
    seabankParser: SeabankNotificationParser,
    ovoParser: OvoNotificationParser,
    danaParser: DanaNotificationParser,
    shopeepayParser: ShopeepayNotificationParser,
    bcaParser: BcaNotificationParser,
    mandiriParser: MandiriNotificationParser,
    briParser: BriNotificationParser,
    bniParser: BniNotificationParser,
    linkAjaParser: LinkAjaNotificationParser,
  ) {
    this.parsers = [
      jagoParser,
      gopayParser,
      seabankParser,
      ovoParser,
      danaParser,
      shopeepayParser,
      bcaParser,
      mandiriParser,
      briParser,
      bniParser,
      linkAjaParser,
    ];
  }

  async processNotification(user: User, dto: SyncNotificationDto) {
    this.logger.log(
      `[Notif] ${dto.app} | "${dto.title}" | "${dto.text.substring(0, 60)}"`,
    );

    const parser = this.parsers.find((p) => p.canParse(dto.app));
    if (!parser) return { status: 'ignored', reason: 'no_parser' };

    const parsed = parser.parse(dto);
    if (!parsed) return { status: 'ignored', reason: 'filtered' };

    // Dedup window: round timestamp down to the nearest 2 minutes.
    // - Same notification fired twice within 2 min (Android retry) → duplicate ✅
    // - Same amount to same wallet twice in one day but different times → NOT duplicate ✅
    // - Using date-only was too broad: transferring the same amount twice in a day
    //   would be incorrectly deduplicated (confirmed bug with BCA Rp10.000 case).
    const ts = new Date(dto.date);
    const windowMinutes = Math.floor(ts.getMinutes() / 2) * 2;
    const timeWindow = `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(2, '0')}-${String(ts.getDate()).padStart(2, '0')}T${String(ts.getHours()).padStart(2, '0')}:${String(windowMinutes).padStart(2, '0')}`;
    const rawRef = `${parsed.fingerprint}|${timeWindow}`;
    const externalRef = `notif_${Buffer.from(rawRef).toString('base64').substring(0, 80)}`;

    const exists = await this.transactionRepo.findOne({
      where: { externalRef, user: { id: user.id } },
    });
    if (exists) return { status: 'duplicate' };

    try {
      const savedTx = await this.saveToDatabase(
        user,
        parsed,
        externalRef,
        dto.date,
      );
      this.logger.log(
        `[Notif] ✓ ${parsed.transactionType} Rp${parsed.amount} → ${parsed.walletName}`,
      );
      return { status: 'imported', transaction: savedTx };
    } catch (err) {
      this.logger.error(
        `[Notif] ✗ Failed to save ${parsed.transactionType} Rp${parsed.amount} from ${dto.app}`,
        err instanceof Error ? err.message : err,
      );
      throw err;
    }
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async findOrCreateWallet(
    userId: number,
    walletName: string,
  ): Promise<Wallet> {
    const normalized = walletName.trim();
    const existing = await this.walletRepo
      .createQueryBuilder('wallet')
      .where('wallet.userId = :userId', { userId })
      .andWhere('LOWER(wallet.name) = LOWER(:name)', {
        name: normalized.toLowerCase(),
      })
      .getOne();
    if (existing) return existing;
    this.logger.log(
      `[Notif] Auto-creating wallet "${normalized}" for user ${userId}`,
    );
    return this.walletRepo.save(
      this.walletRepo.create({
        name: normalized,
        balance: 0,
        user: { id: userId },
      }),
    );
  }

  /**
   * Resolves the category for a parsed notification.
   *
   * Priority:
   *   1. Exact match by name + typeId (e.g. "Food & Drink" expense)
   *   2. "Notification" for the same typeId — dedicated fallback category
   *   3. Any category for this user + typeId (last resort)
   *
   * Transfer transactions (typeId=3) always go to "Notification" transfer,
   * since we model external transfers as expenses in the Jago parser but
   * internal Kantong-to-Kantong transfers still use typeId=3.
   */
  private async resolveCategory(
    userId: number,
    typeId: number,
  ): Promise<TransactionCategory> {
    const notification = await this.categoryRepo.findOne({
      where: {
        user: { id: userId },
        transactionType: { id: typeId },
        name: NOTIFICATION_CATEGORY_NAME,
      },
    });
    if (notification) return notification;

    throw new BadRequestException(
      `No category found for user ${userId} typeId ${typeId}. ` +
        `Run migrations to seed Notification categories.`,
    );
  }

  private async saveToDatabase(
    user: User,
    parsed: ParsedNotification,
    externalRef: string,
    dateStr: string,
  ) {
    const typeId = TRANSACTION_TYPE_ID[parsed.transactionType];
    const category = await this.resolveCategory(user.id, typeId);
    const sourceWallet = await this.findOrCreateWallet(
      user.id,
      parsed.walletName,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transaction = queryRunner.manager.create(Transaction, {
        amount: parsed.amount,
        adminFee: 0,
        note: parsed.note ?? null, // ← store notification text as note
        externalRef,
        createdAt: new Date(dateStr),
        user: { id: user.id },
        transactionType: { id: typeId },
        transactionCategory: { id: category.id },
      });
      const savedTx = await queryRunner.manager.save(Transaction, transaction);

      const sourceTw = queryRunner.manager.create(TransactionWallet, {
        transaction: { id: savedTx.id },
        wallet: { id: sourceWallet.id },
        isIncoming: parsed.transactionType === 'income',
        amount: parsed.amount,
      });
      await queryRunner.manager.save(TransactionWallet, sourceTw);

      if (parsed.transactionType === 'income') {
        await queryRunner.manager
          .createQueryBuilder()
          .update(Wallet)
          .set({ balance: () => '"balance" + :delta' })
          .setParameter('delta', parsed.amount)
          .where('id = :id', { id: sourceWallet.id })
          .execute();
      } else if (parsed.transactionType === 'expense') {
        await queryRunner.manager
          .createQueryBuilder()
          .update(Wallet)
          .set({ balance: () => '"balance" - :delta' })
          .setParameter('delta', parsed.amount)
          .where('id = :id', { id: sourceWallet.id })
          .execute();
      } else if (parsed.transactionType === 'transfer') {
        await queryRunner.manager
          .createQueryBuilder()
          .update(Wallet)
          .set({ balance: () => '"balance" - :delta' })
          .setParameter('delta', parsed.amount)
          .where('id = :id', { id: sourceWallet.id })
          .execute();
      }

      await queryRunner.commitTransaction();
      return savedTx;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error('[Notif] saveToDatabase failed', err);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
