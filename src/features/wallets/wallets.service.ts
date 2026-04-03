import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet } from '../../database/entities/wallet.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { User } from '../../database/entities/user.entity';
import { TransactionCategory } from '../../database/entities/transaction-category.entity';
import { TransactionsService } from '../transactions/transactions.service';
import {
  BALANCE_CORRECTION_CATEGORY_NAME,
  INITIAL_BALANCE_CATEGORY_NAME,
} from '../../common/constants';
import { Transaction } from '../../database/entities/transaction.entity';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,

    @InjectRepository(TransactionCategory)
    private readonly transactionCategoryRepo: Repository<TransactionCategory>,

    @Inject(forwardRef(() => TransactionsService))
    private readonly transactionsService: TransactionsService,

    private readonly dataSource: DataSource,
  ) {}

  async findAll(user: User) {
    return this.walletRepo.find({
      where: { user: { id: user.id } },
      relations: ['user'],
      order: { updatedAt: 'DESC' }, // Sorting wallet berdasarkan aktivitas terbaru
    });
  }

  async findOne(id: number) {
    const wallet = await this.walletRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!wallet) throw new NotFoundException('Wallet not found');
    return wallet;
  }

  async create(user: User, dto: CreateWalletDto) {
    if (dto.balance !== undefined && dto.balance < 0) {
      throw new BadRequestException('Balance cannot be negative');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const initialBalance = dto.balance || 0;
      const walletData = {
        ...dto,
        balance: 0,
        user: { id: user.id },
      };

      let wallet = queryRunner.manager.create(Wallet, walletData);
      wallet = await queryRunner.manager.save(wallet);

      if (initialBalance > 0) {
        const transactionTypeId = 1;
        const transactionCategory = await queryRunner.manager.findOne(
          TransactionCategory,
          {
            where: {
              user: { id: user.id },
              name: INITIAL_BALANCE_CATEGORY_NAME,
              transactionType: { id: transactionTypeId },
            },
          },
        );

        if (!transactionCategory) {
          throw new NotFoundException(
            `Kategori ${INITIAL_BALANCE_CATEGORY_NAME} tidak ditemukan.`,
          );
        }

        await this.transactionsService.createWithManager(
          queryRunner.manager,
          user,
          {
            transactionTypeId,
            amount: initialBalance,
            walletId: wallet.id,
            transactionCategoryId: transactionCategory.id,
            note: 'Saldo Awal',
            createdAt: new Date().toISOString(),
          } as any,
        );

        wallet = await queryRunner.manager.findOne(Wallet, {
          where: { id: wallet.id },
          relations: ['user'],
        });
      }

      await queryRunner.commitTransaction();
      return wallet;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(user: User, id: number, dto: UpdateWalletDto) {
    const wallet = await this.findOne(id);

    if (dto.balance !== undefined && dto.balance < 0) {
      throw new BadRequestException('Balance cannot be negative');
    }

    const isBalanceChanged =
      dto.balance !== undefined && dto.balance !== wallet.balance;

    if (isBalanceChanged) {
      const balanceDiff = dto.balance - wallet.balance;
      const transactionTypeId = balanceDiff > 0 ? 1 : 2;

      const transactionCategory = await this.transactionCategoryRepo.findOne({
        where: {
          user: { id: user.id },
          name: BALANCE_CORRECTION_CATEGORY_NAME,
          transactionType: { id: transactionTypeId },
        },
      });

      if (!transactionCategory) {
        throw new NotFoundException(
          `Kategori ${BALANCE_CORRECTION_CATEGORY_NAME} tidak ditemukan.`,
        );
      }

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const updateData = { ...dto };
        delete updateData.balance;

        if (Object.keys(updateData).length > 0) {
          const walletToUpdate = await queryRunner.manager.findOne(Wallet, {
            where: { id },
          });
          Object.assign(walletToUpdate, updateData);
          walletToUpdate.updatedAt = new Date(); // Force update timestamp manual
          await queryRunner.manager.save(walletToUpdate);
        }

        await this.transactionsService.createWithManager(
          queryRunner.manager,
          user,
          {
            transactionTypeId,
            amount: Math.abs(balanceDiff),
            walletId: wallet.id,
            transactionCategoryId: transactionCategory.id,
            createdAt: new Date().toISOString(),
          } as any,
        );

        await queryRunner.commitTransaction();
        return await this.findOne(id);
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    }

    const updateData = { ...dto };
    delete updateData.balance;

    if (Object.keys(updateData).length > 0) {
      Object.assign(wallet, updateData);
      wallet.updatedAt = new Date(); // Force update timestamp manual
      return await this.walletRepo.save(wallet);
    }

    return wallet;
  }

  async remove(id: number) {
    const wallet = await this.findOne(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Ambil semua ID transaksi yang terhubung ke wallet ini melalui TransactionWallet
      const relatedTransactions = await queryRunner.manager
        .createQueryBuilder(Transaction, 'transaction')
        .innerJoin('transaction.transactionWallets', 'tw')
        .where('tw.walletId = :walletId', { walletId: id })
        .select('transaction.id')
        .getMany();

      const transactionIds = relatedTransactions.map((t) => t.id);

      // 2. Hapus Transactions (Ini otomatis menghapus TransactionWallet karena CASCADE di level entity)
      if (transactionIds.length > 0) {
        await queryRunner.manager.delete(Transaction, transactionIds);
      }

      // 3. Hapus Wallet-nya sendiri
      await queryRunner.manager.remove(Wallet, wallet);

      await queryRunner.commitTransaction();
      return { deleted: true };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
