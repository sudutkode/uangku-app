import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { createHash } from 'crypto';

import { User } from '../../database/entities/user.entity';
import { TransactionCategory } from '../../database/entities/transaction-category.entity';
import { JwtPayload } from './types/jwt-payload.type';
import { TRANSACTION_CATEGORIES } from '../../common/constants';
import { GoogleSignInDto } from './dto/google-sign-in.dto';

const FUN_NAMES = [
  'FrostedCupcake',
  'MangoLassi',
  'CoconutJelly',
  'BubbleWaffle',
  'TaroSoftServe',
  'LycheeSlushie',
  'HoneyDonut',
  'PeachSorbet',
  'CinnamonRoll',
  'PistachioMochi',
  'WatermelonPop',
  'CaramelFlan',
  'BlueberryCrepe',
  'MapleToffee',
  'StrawberryBoba',
  'PandanCake',
  'TiramisuBite',
  'LimoncelloGel',
  'RaspberrySwirl',
  'MochaCookie',
];

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
  );

  constructor(
    private readonly dataSource: DataSource,

    private readonly jwtService: JwtService,
  ) {}

  /**
   * Creates a short deterministic 8-digit identifier from email + salt.
   * This ensures no personally identifiable information (PII) is persisted.
   *
   * Example output: 48271936
   */
  private hashIdentifier(email: string): string {
    const salt = process.env.SALT;
    const hashHex = createHash('sha256')
      .update(email.toLowerCase() + salt)
      .digest('hex');

    const numericId = Number(BigInt(`0x${hashHex.slice(0, 12)}`) % 100000000n);
    return numericId.toString().padStart(8, '0');
  }

  /**
   * Generates a fun, random default username for new users.
   */
  private generateDefaultUsername(): string {
    const name = FUN_NAMES[Math.floor(Math.random() * FUN_NAMES.length)];
    const suffix = Math.floor(10 + Math.random() * 90);
    return `${name}${suffix}`;
  }

  async googleSignIn(
    dto: GoogleSignInDto,
  ): Promise<{ user: User; accessToken: string; isNewUser: boolean }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    let isNewUser = false;

    try {
      await queryRunner.startTransaction();

      const ticket = await this.googleClient.verifyIdToken({
        idToken: dto.idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new BadRequestException('Invalid Google Token');
      }

      // Derive an anonymous identifier from the email — never store the email itself.
      const identifierHash = this.hashIdentifier(payload.email);

      let user = await queryRunner.manager.findOne(User, {
        where: { identifierHash },
      });

      if (!user) {
        isNewUser = true;

        const username = this.generateDefaultUsername();
        const newUser = queryRunner.manager.create(User, {
          identifierHash,
          username,
        });

        user = await queryRunner.manager.save(User, newUser);

        // Seed default transaction categories for the new user.
        const categories = TRANSACTION_CATEGORIES.map((c) =>
          queryRunner.manager.create(TransactionCategory, { ...c, user }),
        );
        await queryRunner.manager.save(TransactionCategory, categories);
      }

      await queryRunner.commitTransaction();

      const jwtPayload: JwtPayload = {
        id: user.id,
        sub: user.identifierHash,
      };

      const accessToken = await this.jwtService.signAsync(jwtPayload);

      return { user, accessToken, isNewUser };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.stack : String(error);
      this.logger.error('Google Sign-In failed', errorMessage);

      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Authentication process failed');
    } finally {
      await queryRunner.release();
    }
  }
}
