import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: [
        { email: createUserDto.email },
        { username: createUserDto.username },
      ],
    });

    if (existingUser) {
      throw new ConflictException('Email or username already exists');
    }

    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find({
      select: [
        'id',
        'email',
        'username',
        'firstName',
        'lastName',
        'avatar',
        'bio',
        'followersCount',
        'followingCount',
        'postsCount',
        'createdAt',
      ],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'username',
        'firstName',
        'lastName',
        'avatar',
        'bio',
        'followersCount',
        'followingCount',
        'postsCount',
        'createdAt',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not foun');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { username },
      select: [
        'id',
        'email',
        'username',
        'firstName',
        'lastName',
        'avatar',
        'bio',
        'followersCount',
        'followingCount',
        'postsCount',
        'createdAt',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async updateCounts(
    userId: string,
    field: 'followersCount' | 'followingCount' | 'postsCount',
    increment: boolean,
  ) {
    const operator = increment ? '+' : '-';
    await this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({ [field]: () => `${field} ${operator} 1` })
      .where('id = :userId', { userId })
      .execute();
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }
}
