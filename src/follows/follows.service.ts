import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow)
    private followsRepository: Repository<Follow>,
    private usersService: UsersService,
  ) {}

  async followUser(
    followingId: string,
    follower: User,
  ): Promise<{ message: string }> {
    if (followingId === follower.id) {
      throw new BadRequestException('You cannot follow yourself');
    }

    await this.usersService.findOne(followingId); // Verify user exists

    const existingFollow = await this.followsRepository.findOne({
      where: { followerId: follower.id, followingId },
    });

    if (existingFollow) {
      throw new ConflictException('Already following this user');
    }

    const follow = this.followsRepository.create({
      followerId: follower.id,
      followingId,
    });

    await this.followsRepository.save(follow);

    // Update counts
    await this.usersService.updateCounts(followingId, 'followersCount', true);
    await this.usersService.updateCounts(follower.id, 'followingCount', true);

    return { message: 'User followed successfully' };
  }

  async unfollowUser(
    followingId: string,
    follower: User,
  ): Promise<{ message: string }> {
    const follow = await this.followsRepository.findOne({
      where: { followerId: follower.id, followingId },
    });

    if (!follow) {
      throw new NotFoundException('Follow relationship not found');
    }

    await this.followsRepository.remove(follow);

    // Update counts
    await this.usersService.updateCounts(followingId, 'followersCount', false);
    await this.usersService.updateCounts(follower.id, 'followingCount', false);

    return { message: 'User unfollowed successfully' };
  }

  async getFollowers(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ followers: User[]; total: number }> {
    const [follows, total] = await this.followsRepository.findAndCount({
      where: { followingId: userId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['follower'],
    });

    const followers = follows.map((follow) => follow.follower);
    return { followers, total };
  }

  async getFollowing(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ following: User[]; total: number }> {
    const [follows, total] = await this.followsRepository.findAndCount({
      where: { followerId: userId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['following'],
    });

    const following = follows.map((follow) => follow.following);
    return { following, total };
  }

  async checkFollowStatus(
    followerId: string,
    followingId: string,
  ): Promise<boolean> {
    const follow = await this.followsRepository.findOne({
      where: { followerId, followingId },
    });

    return !!follow;
  }
}
