import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Not, And } from 'typeorm';
import { TransactionCategory } from '../../database/entities/transaction-category.entity';
import { CreateTransactionCategoryDto } from './dto/create-transaction-category.dto';
import { UpdateTransactionCategoryDto } from './dto/update-transaction-category.dto';
import { User } from '../../database/entities/user.entity';
import { FindAllOptions } from '../../common/interfaces/find.interfaces';
import { NOTIFICATION_CATEGORY_NAME } from '../../common/constants';
import { Icon } from '../../database/entities/icon.entity';

@Injectable()
export class TransactionCategoriesService {
  constructor(
    @InjectRepository(TransactionCategory)
    private readonly transactionCategoryRepo: Repository<TransactionCategory>,
    @InjectRepository(Icon)
    private readonly iconRepo: Repository<Icon>,
  ) {}

  async create(user: User, dto: CreateTransactionCategoryDto) {
    const existing = await this.transactionCategoryRepo.findOne({
      where: {
        name: ILike(dto.name),
        user: { id: user.id },
        transactionType: { id: dto.transactionTypeId },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Category "${dto.name}" already exists for this transaction type.`,
      );
    }

    const transactionCategory = this.transactionCategoryRepo.create({
      name: dto.name,
      iconName: dto.iconName || null,
      transactionType: { id: dto.transactionTypeId },
      user: { id: user.id },
    });

    return this.transactionCategoryRepo.save(transactionCategory);
  }

  async findAll(
    user: User,
    options: FindAllOptions & { search?: string; withNotification?: boolean },
  ) {
    const { page, limit, transactionTypeId, search, withNotification } =
      options;
    const skip = (page - 1) * limit;

    const nameConditions: any[] = [];

    if (!withNotification) {
      nameConditions.push(Not(NOTIFICATION_CATEGORY_NAME));
    }

    if (search) {
      nameConditions.push(ILike(`%${search}%`));
    }

    const where: any = {
      user: { id: user.id },
    };

    if (nameConditions.length > 1) {
      where.name = And(...nameConditions);
    } else if (nameConditions.length === 1) {
      where.name = nameConditions[0];
    }

    if (transactionTypeId) {
      where.transactionType = { id: transactionTypeId };
    }

    const [data, total] = await this.transactionCategoryRepo.findAndCount({
      where,
      relations: ['transactionType'],
      skip,
      take: limit,
      order: { id: 'DESC' },
    });

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const transactionCategory = await this.transactionCategoryRepo.findOne({
      where: { id },
      relations: ['transactionType', 'user'],
    });

    if (!transactionCategory) {
      throw new NotFoundException('Transaction category not found');
    }

    return transactionCategory;
  }

  async update(id: number, dto: UpdateTransactionCategoryDto) {
    const transactionCategory = await this.findOne(id);

    // Check for duplicate name (excluding current record)
    if (dto.name && dto.transactionTypeId) {
      const duplicate = await this.transactionCategoryRepo.findOne({
        where: {
          id: Not(id),
          name: ILike(dto.name),
          user: { id: transactionCategory.user.id },
          transactionType: { id: dto.transactionTypeId },
        },
      });

      if (duplicate) {
        throw new BadRequestException(
          `Another category named "${dto.name}" already exists for this transaction type.`,
        );
      }
    }

    Object.assign(transactionCategory, dto);
    return this.transactionCategoryRepo.save(transactionCategory);
  }

  async remove(id: number) {
    const transactionCategory = await this.findOne(id);
    await this.transactionCategoryRepo.remove(transactionCategory);
    return { deleted: true };
  }

  async findAllIcons(
    search?: string,
    limit: number = 60,
    offset: number = 0,
    selected?: string,
  ) {
    const query = this.iconRepo.createQueryBuilder('icon');

    // Logic Pencarian
    if (search) {
      query.where('(icon.label ILIKE :s OR icon.name ILIKE :s)', {
        s: `%${search}%`,
      });
    }

    // Logic Prioritas Ikon Terpilih (Hanya di page 1 / offset 0)
    if (selected && offset === 0) {
      query.addSelect(
        `CASE WHEN icon.name = :selected THEN 0 ELSE 1 END`,
        'priority',
      );
      query.setParameter('selected', selected);
      query.orderBy('priority', 'ASC');
      query.addOrderBy('icon.label', 'ASC');
    } else {
      query.orderBy('icon.label', 'ASC');
    }

    const [items, total] = await query
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return { items, total };
  }
}
