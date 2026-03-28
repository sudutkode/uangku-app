import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../database/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Ganti findByEmail menjadi findByIdentifier
  async findByIdentifier(identifier: string): Promise<User | undefined> {
    // Di sini identifier yang masuk sudah hasil hash dari service lain atau JWT
    return this.userRepository.findOne({
      where: { identifierHash: identifier },
    });
  }

  async updateUsername(id: number, newUsername: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    user.username = newUsername;
    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    await this.userRepository.remove(user);
  }
}
