import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { User } from '../../database/entities/user.entity';
import { Transaction } from '../../database/entities/transaction.entity';
import { TransactionWallet } from '../../database/entities/transaction-wallet.entity';
import { Wallet } from '../../database/entities/wallet.entity';
import { TransactionCategory } from '../../database/entities/transaction-category.entity';

import { JagoNotificationParser } from './parsers/jago-notification.parser';
import { GopayNotificationParser } from './parsers/gopay-notification.parser';
import { SeabankNotificationParser } from './parsers/seabank-notification.parser';
import { OvoNotificationParser } from './parsers/ovo-notification.parser';
import { DanaNotificationParser } from './parsers/dana-notification.parser';
import { ShopeeNotificationParser } from './parsers/shopeepay-notification.parser';
import { BcaNotificationParser } from './parsers/bca-notification.parser';
import { LivinNotificationParser } from './parsers/livin-notification.parser';
import { BrimoNotificationParser } from './parsers/brimo-notification.parser';
import { WondrNotificationParser } from './parsers/wondr-notification.parser';

const ALL_PARSERS = [
  JagoNotificationParser,
  GopayNotificationParser,
  SeabankNotificationParser,
  OvoNotificationParser,
  DanaNotificationParser,
  ShopeeNotificationParser,
  BcaNotificationParser,
  LivinNotificationParser,
  BrimoNotificationParser,
  WondrNotificationParser,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Transaction,
      TransactionWallet,
      Wallet,
      TransactionCategory,
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, ...ALL_PARSERS],
})
export class NotificationsModule {}
