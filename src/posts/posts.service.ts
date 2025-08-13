import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    private usersService: UsersService,
  ) { }

  async create(createPostsDto: CreatePostDto, user: User): Promise<Post> {
    const post = this.postRepository.create({
      ...createPostsDto,
      authorId: user.id,
    });

    const savedPost = await this.postRepository.save(post);
    await this.usersService.updateCounts(user.id, 'postsCount', true);

    return savedPost;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ posts: Post[]; total: number }> {
    const [posts, total] = await this.postRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['author'],
    });

    return { posts, total };
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async findByAuthor(
    authorId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ posts: Post[]; total: number }> {
    const [posts, total] = await this.postRepository.findAndCount({
      where: { authorId },
      skip: (page - 1) \* limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['author'],
    });

    return { posts, total };
  }

  async update(id: string, updatePostDto: UpdatePostDto, user: User): Promise<Post> {
    const post = await this.findOne(id);

    if (post.authorId !== user.id) {
      throw new ForbiddenException('You can only update your own posts');
    }

    await this.postRepository.update(id, updatePostDto);
    return this.findOne(id);
  }

  async remove(id: string, user: User): Promise<void> {
    const post = await this.findOne(id);

    if (post.authorId !== user.id) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.postRepository.delete(id);
    await this.usersService.updateCounts(user.id, 'postsCount', false);
  }

  async updateCounts(postId: string, field: 'likesCount' | 'commentsCount', increment: boolean) {
    const operator = increment ? '+' : '-';
    await this.postRepository
      .createQueryBuilder()
      .update(Post)
      .set({ [field]: () => `${field} ${operator} 1` })
      .where('id = :postId', { postId })
      .execute();
  }
}
