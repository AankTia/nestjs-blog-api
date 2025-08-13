import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostsService } from 'src/posts/posts.service';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private likesRepository: Repository<Like>,
    private postsService: PostsService,
  ) {}

  async likePost(postId: string, user: User): Promise<{ message: string }> {
    await this.postsService.findOne(postId); // Verify post exists

    const existingLike = await this.likesRepository.findOne({
      where: { postId, userId: user.id },
    });

    if (existingLike) {
      throw new ConflictException('Post already liked');
    }

    const like = this.likesRepository.create({
      postId,
      userId: user.id,
    });

    await this.likesRepository.save(like);
    await this.postsService.updateCounts(postId, 'likesCount', true);

    return { message: 'Post liked successfully' };
  }

  async unlikePost(postId: string, user: User): Promise<{ message: string }> {
    const like = await this.likesRepository.findOne({
      where: { postId, userId: user.id },
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    await this.likesRepository.remove(like);
    await this.postsService.updateCounts(postId, 'likesCount', false);

    return { message: 'Post unliked successfully' };
  }

  async getPostLikes(
    postId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ likes: Like[]; total: number }> {
    const [likes, total] = await this.likesRepository.findAndCount({
      where: { postId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });

    return { likes, total };
  }

  async checkUserLike(postId: string, userId: string): Promise<boolean> {
    const like = await this.likesRepository.findOne({
      where: { postId, userId },
    });

    return !!like;
  }
}
