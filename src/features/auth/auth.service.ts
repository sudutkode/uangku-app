import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Wallet } from '../../database/entities/wallet.entity';
import { TransactionCategory } from '../../database/entities/transaction-category.entity';
import { hashPassword } from '../../common/utils/bcrypt.util';
import { JwtPayload } from './types/jwt-payload.type';
import { JwtService } from '@nestjs/jwt';
import { TRANSACTION_CATEGORIES } from '../../common/constants';
import { GoogleSignInDto } from './dto/google-sign-in.dto';
import { randomBytes } from 'crypto';

import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  private readonly googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
  );

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async googleSignIn(
    dto: GoogleSignInDto,
  ): Promise<{ user: User; accessToken: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: dto.idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new BadRequestException('Invalid Google Token');
      }

      const verifiedEmail = payload.email;
      const verifiedName = payload.name;
      const verifiedAvatar = payload.picture;

      let user = await queryRunner.manager.findOne(User, {
        where: { email: verifiedEmail },
      });

      if (!user) {
        if (!verifiedName) {
          throw new BadRequestException('Name is required from Google Profile');
        }

        const randomPassword = randomBytes(32).toString('hex');
        const hashed = await hashPassword(randomPassword);

        const newUser = queryRunner.manager.create(User, {
          email: verifiedEmail,
          password: hashed,
          name: verifiedName,
          avatar: verifiedAvatar,
        });
        user = await queryRunner.manager.save(User, newUser);

        const wallet = queryRunner.manager.create(Wallet, {
          name: 'Cash',
          user,
        });
        await queryRunner.manager.save(Wallet, wallet);

        const categories = TRANSACTION_CATEGORIES.map((c) =>
          queryRunner.manager.create(TransactionCategory, { ...c, user }),
        );
        await queryRunner.manager.save(TransactionCategory, categories);
      } else {
        if (verifiedAvatar && user.avatar !== verifiedAvatar) {
          await queryRunner.manager.update(User, user.id, {
            avatar: verifiedAvatar,
          });
          user.avatar = verifiedAvatar;
        }
      }

      await queryRunner.commitTransaction();

      const jwtPayload: JwtPayload = { id: user.id, email: user.email };
      const accessToken = await this.jwtService.signAsync(jwtPayload);
      if (user.password) delete user.password;

      return { user, accessToken };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Google Sign-In failed', error);
      throw new InternalServerErrorException('Google Sign-In failed');
    } finally {
      await queryRunner.release();
    }
  }
}
