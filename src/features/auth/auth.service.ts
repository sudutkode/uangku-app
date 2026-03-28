import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { createHash } from 'crypto';

import { User } from '../../database/entities/user.entity';
import { TransactionCategory } from '../../database/entities/transaction-category.entity';
import { JwtPayload } from './types/jwt-payload.type';
import { TRANSACTION_CATEGORIES } from '../../common/constants';
import { GoogleSignInDto } from './dto/google-sign-in.dto';

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

  /**
   * Mengubah email menjadi hash unik agar identitas asli user tidak tersimpan di DB.
   * Gunakan SALT dari .env untuk keamanan ekstra.
   */
  private hashIdentifier(email: string): string {
    const salt = process.env.APP_AUTH_SALT || 'default_salt_uangku_2026';
    return createHash('sha256')
      .update(email.toLowerCase() + salt)
      .digest('hex');
  }

  async googleSignIn(
    dto: GoogleSignInDto,
  ): Promise<{ user: User; accessToken: string; isNewUser: boolean }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    let isNewUser = false;

    try {
      await queryRunner.startTransaction();

      // 1. Verifikasi Token Google
      const ticket = await this.googleClient.verifyIdToken({
        idToken: dto.idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new BadRequestException('Invalid Google Token');
      }

      // 2. Transformasi Email menjadi Anonymous Identifier
      const identifierHash = this.hashIdentifier(payload.email);

      // 3. Cari User berdasarkan IdentifierHash (Bukan Email)
      let user = await queryRunner.manager.findOne(User, {
        where: { identifierHash },
      });

      if (!user) {
        isNewUser = true;

        // Generate Username Default (Ambil 6 karakter pertama dari hash)
        const defaultUsername = `User_${identifierHash.substring(0, 6)}`;

        const newUser = queryRunner.manager.create(User, {
          identifierHash,
          username: defaultUsername,
        });

        user = await queryRunner.manager.save(User, newUser);

        // 4. Inisialisasi Kategori Default untuk User Baru
        const categories = TRANSACTION_CATEGORIES.map((c) =>
          queryRunner.manager.create(TransactionCategory, { ...c, user }),
        );
        await queryRunner.manager.save(TransactionCategory, categories);
      }

      await queryRunner.commitTransaction();

      // 5. Generate JWT Access Token
      // Payload hanya berisi ID dan Hash, tidak ada data pribadi
      const jwtPayload: JwtPayload = {
        id: user.id,
        sub: user.identifierHash,
      };

      const accessToken = await this.jwtService.signAsync(jwtPayload);

      return { user, accessToken, isNewUser };
    } catch (error) {
      this.logger.error('Google Sign-In failed', error.stack);

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
