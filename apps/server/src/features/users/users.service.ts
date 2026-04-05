import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../database/entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    return user;
  }

  // Ganti findByEmail menjadi findByIdentifier
  async findByIdentifier(identifier: string): Promise<User | undefined> {
    // Di sini identifier yang masuk sudah hasil hash dari service lain atau JWT
    return this.userRepository.findOne({
      where: { identifierHash: identifier },
    });
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Cek apakah username sudah dipakai orang lain
    const existingUser = await this.userRepository.findOne({
      where: { username: dto.username },
    });

    if (existingUser && existingUser.id !== id) {
      throw new ConflictException('Username sudah digunakan');
    }

    user.username = dto.username;
    user.updatedAt = new Date();

    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    await this.userRepository.remove(user);
  }
}
