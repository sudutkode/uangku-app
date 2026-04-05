import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { User } from '../../database/entities/user.entity';
import { Transaction } from '../../database/entities/transaction.entity';
import { TransactionWallet } from '../../database/entities/transaction-wallet.entity';
import { Wallet } from '../../database/entities/wallet.entity';
import { TransactionCategory } from '../../database/entities/transaction-category.entity';
import { SyncNotificationDto } from './dto/sync-notification.dto';
import { NOTIFICATION_CATEGORY_NAME } from '../../common/constants';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(TransactionCategory)
    private readonly categoryRepo: Repository<TransactionCategory>,
  ) {}

  async processNotification(user: User, dto: SyncNotificationDto) {
    this.logger.log(`[Notif] Processing: ${dto.appName} | ${dto.title}`);

    // 2. Cari Wallet berdasarkan appName
    const wallet = await this.walletRepo.findOne({
      where: { appName: dto.appName, user: { id: user.id } },
    });

    if (!wallet) {
      this.logger.warn(`[Notif] No wallet linked to app: ${dto.appName}`);
      // Kirim pesan simple dalam bahasa Inggris sebagai identifier
      throw new BadRequestException('Wallet not found');
    }

    const amount = dto.amount;

    // 3. Deduplikasi (Fingerprint)
    const ts = new Date(dto.date);
    const timeWindow = `${ts.getFullYear()}-${ts.getMonth() + 1}-${ts.getDate()} ${ts.getHours()}:${ts.getMinutes()}`;
    const rawRef = `${dto.appName}|${dto.transactionTypeId}|${amount}|${timeWindow}`;
    const externalRef = `notif_${Buffer.from(rawRef).toString('base64').substring(0, 80)}`;

    const exists = await this.transactionRepo.findOne({
      where: { externalRef, user: { id: user.id } },
    });

    if (exists) return { status: 'duplicate' };

    // 4. Simpan ke Database
    try {
      const savedTx = await this.saveToDatabase(
        user,
        dto,
        wallet,
        amount,
        externalRef,
      );
      this.logger.log(`[Notif] ✓ Recorded Rp${amount} for ${wallet.name}`);
      return { status: 'imported', transaction: savedTx };
    } catch (err) {
      this.logger.error(`[Notif] Critical error: ${err.message}`);
      throw err;
    }
  }

  private async saveToDatabase(
    user: User,
    dto: SyncNotificationDto,
    wallet: Wallet,
    amount: number,
    externalRef: string,
  ) {
    // Resolve kategori "Notification" otomatis berdasarkan typeId
    const category = await this.categoryRepo.findOne({
      where: {
        user: { id: user.id },
        transactionType: { id: dto.transactionTypeId },
        name: NOTIFICATION_CATEGORY_NAME,
      },
    });

    if (!category) {
      throw new BadRequestException(
        `Category "${NOTIFICATION_CATEGORY_NAME}" not found for type ${dto.transactionTypeId}`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Di dalam processNotification atau saveToDatabase
      const safeTitle = dto.title || '';
      const safeText = dto.text || '';

      const transaction = queryRunner.manager.create(Transaction, {
        amount,
        note:
          `${safeTitle} ${safeText}`.trim().substring(0, 255) ||
          'Transaction from notification',
        externalRef,
        createdAt: new Date(dto.date),
        user: { id: user.id },
        transactionType: { id: dto.transactionTypeId },
        transactionCategory: { id: category.id },
      });
      const savedTx = await queryRunner.manager.save(Transaction, transaction);

      // Simpan ke TransactionWallet (Pivot)
      const isIncoming = dto.transactionTypeId === 1; // Asumsi 1 = Income, sesuaikan dengan ID di DB mu
      await queryRunner.manager.save(TransactionWallet, {
        transaction: { id: savedTx.id },
        wallet: { id: wallet.id },
        isIncoming: isIncoming,
        amount: amount,
      });

      // Update Balance Wallet
      const balanceChange = isIncoming ? amount : -amount;
      await queryRunner.manager.update(Wallet, wallet.id, {
        balance: () => `balance + ${balanceChange}`,
      });

      await queryRunner.commitTransaction();
      return savedTx;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
