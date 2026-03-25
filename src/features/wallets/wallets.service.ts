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
      order: { id: 'ASC' },
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
    const wallet = this.walletRepo.create({
      ...dto,
      user: { id: user.id },
    });
    return await this.walletRepo.save(wallet);
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
          name: 'Balance Correction',
          transactionType: { id: transactionTypeId },
        },
      });

      if (!transactionCategory) {
        throw new NotFoundException(
          `Kategori 'Balance Correction' tidak ditemukan.`,
        );
      }

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Hapus balance dari copy DTO agar tidak ikut terupdate manual
        const updateData = { ...dto };
        delete updateData.balance;

        if (Object.keys(updateData).length > 0) {
          await queryRunner.manager.update(Wallet, id, updateData);
        }

        // Biarkan TransactionsService yang mengurus update saldo via TransactionWallet
        await this.transactionsService.createWithManager(
          queryRunner.manager,
          user,
          {
            transactionTypeId,
            amount: Math.abs(balanceDiff),
            walletId: wallet.id,
            transactionCategoryId: transactionCategory.id,
          },
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

    // Jika tidak ada perubahan saldo, hapus balance dari dto sebelum save
    const updateData = { ...dto };
    delete updateData.balance;

    if (Object.keys(updateData).length > 0) {
      Object.assign(wallet, updateData);
      return await this.walletRepo.save(wallet);
    }

    return wallet;
  }

  async remove(id: number) {
    const wallet = await this.findOne(id);
    await this.walletRepo.remove(wallet);
    return { deleted: true };
  }
}
