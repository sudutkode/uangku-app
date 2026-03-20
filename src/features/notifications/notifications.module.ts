import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { User } from '../../database/entities/user.entity';
import { Transaction } from '../../database/entities/transaction.entity';
import { TransactionWallet } from '../../database/entities/transaction-wallet.entity';
import { Wallet } from '../../database/entities/wallet.entity';
import { TransactionCategory } from '../../database/entities/transaction-category.entity';

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

const ALL_PARSERS = [
  JagoNotificationParser,
  GopayNotificationParser,
  SeabankNotificationParser,
  OvoNotificationParser,
  DanaNotificationParser,
  ShopeepayNotificationParser,
  BcaNotificationParser,
  MandiriNotificationParser,
  BriNotificationParser,
  BniNotificationParser,
  LinkAjaNotificationParser,
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
