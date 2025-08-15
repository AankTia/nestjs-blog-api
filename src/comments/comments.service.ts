import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { PostsService } from 'src/posts/posts.service';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    private postsService: PostsService,
  ) { }

  async create(
    postId: string,
    createCommentDto: CreateCommentDto,
    user: User,
  ): Promise<Comment> {
    await this.postsService.findOne(postId); // Verify post exists

    const comment = this.commentsRepository.create({
      ...createCommentDto,
      postId,
      authorId: user.id,
    });

    const savedComment = await this.commentsRepository.save(comment);
    await this.postsService.updateCounts(postId, 'commentsCount', true);

    return savedComment;
  }

  async createReply(
    commentId: string,
    createCommentDto: CreateCommentDto,
    user: User,
  ): Promise<Comment> {
    const parentComment = await this.commentsRepository.findOne({
      where: { id: commentId },
      relations: ['post'],
    });

    if (!parentComment) {
      throw new NotFoundException('Comment not found');
    }

    const comment = this.commentsRepository.create({
      ...createCommentDto,
      postId: parentComment.post.id,
      parentId: commentId,
      authorId: user.id,
    });

    const savedComment = await this.commentsRepository.save(comment);
    await this.postsService.updateCounts(
      parentComment.postId,
      'commentsCount',
      true,
    );

    return savedComment;
  }

  async findByPost(
    postId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ comments: Comment[]; total: number }> {
    const [comments, total] = await this.commentsRepository.findAndCount({
      where: { postId }, // Only top-level comments
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['author', 'replies', 'replies.author'],
    });

    return { comments, total };
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['author', 'post', 'replies', 'replies.author'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
    user: User,
  ): Promise<Comment> {
    const comment = await this.findOne(id);

    if (comment.authorId !== user.id) {
      throw new ForbiddenException('You can only update your own comments');
    }

    await this.commentsRepository.update(id, updateCommentDto);
    return this.findOne(id);
  }

  async remove(id: string, user: User): Promise<void> {
    const comment = await this.findOne(id);

    if (comment.authorId !== user.id) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentsRepository.delete(id);
    await this.postsService.updateCounts(
      comment.post.id,
      'commentsCount',
      false,
    );
  }

  async getReplies(
    commentId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ replies: Comment[]; total: number }> {
    // Verify parent comment exists
    await this.findOne(commentId);

    const [replies, total] = await this.commentsRepository.findAndCount({
      where: { parentId: commentId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'ASC' }, // Replies in chronological order
      relations: ['author'],
    });

    return { replies, total };
  }
}
