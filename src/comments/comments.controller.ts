import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  ParseUUIDPipe,
  Query,
  Request,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('posts/:postId/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add comment to post',
    description:
      'Create a new comment on a specific post. User must be authenticated.',
  })
  @ApiParam({ name: 'postId', description: 'Post UUID', type: 'string' })
  @ApiResponse({
    status: 201,
    description: 'Comment added successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        content: 'Great post! Thanks for sharing.',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        authorId: '456e7890-e89b-12d3-a456-426614174001',
        postId: '789e0123-e89b-12d3-a456-426614174002',
        parentId: null,
        author: {
          id: '456e7890-e89b-12d3-a456-426614174001',
          username: 'johndoe',
          firstName: 'John',
          lastName: 'Doe',
          avatar: 'avatar.jpg',
        },
        replies: [],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async createComment(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req,
  ) {
    return this.commentsService.create(postId, createCommentDto, req.user);
  }

  @Post('comments/:commentId/reply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Reply to comment',
    description:
      'Create a reply to an existing comment. User must be authenticated.',
  })
  @ApiParam({
    name: 'commentId',
    description: 'Comment UUID to reply to',
    type: 'string',
  })
  @ApiResponse({
    status: 201,
    description: 'Reply added successfully',
    schema: {
      example: {
        id: '987e6543-e89b-12d3-a456-426614174003',
        content: 'I totally agree with your point!',
        createdAt: '2024-01-15T10:45:00Z',
        updatedAt: '2024-01-15T10:45:00Z',
        authorId: '654e3210-e89b-12d3-a456-426614174004',
        postId: '789e0123-e89b-12d3-a456-426614174002',
        parentId: '123e4567-e89b-12d3-a456-426614174000',
        author: {
          id: '654e3210-e89b-12d3-a456-426614174004',
          username: 'janedoe',
          firstName: 'Jane',
          lastName: 'Doe',
          avatar: 'jane-avatar.jpg',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({ status: 404, description: 'Parent comment not found' })
  async replyToComment(
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req,
  ) {
    return this.commentsService.createReply(
      commentId,
      createCommentDto,
      req.user,
    );
  }

  @Get('posts/:postId/comments')
  @ApiOperation({
    summary: 'Get post comments',
    description:
      'Retrieve all top-level comments for a specific post with pagination. Includes nested replies.',
  })
  @ApiParam({ name: 'postId', description: 'Post UUID', type: 'string' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Comments retrieved successfully',
    schema: {
      example: {
        comments: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            content: 'Great post! Thanks for sharing.',
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-15T10:30:00Z',
            authorId: '456e7890-e89b-12d3-a456-426614174001',
            postId: '789e0123-e89b-12d3-a456-426614174002',
            parentId: null,
            author: {
              id: '456e7890-e89b-12d3-a456-426614174001',
              username: 'johndoe',
              firstName: 'John',
              lastName: 'Doe',
              avatar: 'avatar.jpg',
            },
            replies: [
              {
                id: '987e6543-e89b-12d3-a456-426614174003',
                content: 'I totally agree!',
                createdAt: '2024-01-15T10:45:00Z',
                author: {
                  username: 'janedoe',
                  firstName: 'Jane',
                  lastName: 'Doe',
                },
              },
            ],
          },
        ],
        total: 25,
        page: 1,
        limit: 10,
        totalPages: 3,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async getPostComments(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    const result = await this.commentsService.findByPost(postId, page, limit);
    return {
      ...result,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }

  @Get('comments/:commentId')
  @ApiOperation({
    summary: 'Get single comment',
    description:
      'Retrieve a specific comment by ID with all its replies and author information.',
  })
  @ApiParam({ name: 'commentId', description: 'Comment UUID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Comment found successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        content: 'Great post! Thanks for sharing.',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        authorId: '456e7890-e89b-12d3-a456-426614174001',
        postId: '789e0123-e89b-12d3-a456-426614174002',
        parentId: null,
        author: {
          id: '456e7890-e89b-12d3-a456-426614174001',
          username: 'johndoe',
          firstName: 'John',
          lastName: 'Doe',
          avatar: 'avatar.jpg',
        },
        post: {
          id: '789e0123-e89b-12d3-a456-426614174002',
          title: 'My Blog Post',
          author: {
            username: 'author123',
          },
        },
        replies: [
          {
            id: '987e6543-e89b-12d3-a456-426614174003',
            content: 'I totally agree!',
            createdAt: '2024-01-15T10:45:00Z',
            author: {
              username: 'janedoe',
              firstName: 'Jane',
            },
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async getComment(@Param('commentId', ParseUUIDPipe) commentId: string) {
    return this.commentsService.findOne(commentId);
  }

  @Get('comments/:commentId/replies')
  @ApiOperation({
    summary: 'Get comment replies',
    description: 'Retrieve all replies for a specific comment with pagination.',
  })
  @ApiParam({
    name: 'commentId',
    description: 'Parent comment UUID',
    type: 'string',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Replies retrieved successfully',
    schema: {
      example: {
        replies: [
          {
            id: '987e6543-e89b-12d3-a456-426614174003',
            content: 'I totally agree with your point!',
            createdAt: '2024-01-15T10:45:00Z',
            updatedAt: '2024-01-15T10:45:00Z',
            authorId: '654e3210-e89b-12d3-a456-426614174004',
            postId: '789e0123-e89b-12d3-a456-426614174002',
            parentId: '123e4567-e89b-12d3-a456-426614174000',
            author: {
              id: '654e3210-e89b-12d3-a456-426614174004',
              username: 'janedoe',
              firstName: 'Jane',
              lastName: 'Doe',
              avatar: 'jane-avatar.jpg',
            },
          },
        ],
        total: 8,
        page: 1,
        limit: 5,
        totalPages: 2,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Parent comment not found' })
  async getCommentReplies(
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 5,
  ) {
    const result = await this.commentsService.getReplies(
      commentId,
      page,
      limit,
    );
    return {
      ...result,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }

  @Patch('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update comment',
    description:
      'Update a comment. Only the comment author can update their own comments.',
  })
  @ApiParam({ name: 'commentId', description: 'Comment UUID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Comment updated successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        content: 'Updated comment content with more details.',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T11:15:00Z',
        authorId: '456e7890-e89b-12d3-a456-426614174001',
        postId: '789e0123-e89b-12d3-a456-426614174002',
        parentId: null,
        author: {
          id: '456e7890-e89b-12d3-a456-426614174001',
          username: 'johndoe',
          firstName: 'John',
          lastName: 'Doe',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only update your own comments',
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async updateComment(
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req,
  ) {
    return this.commentsService.update(commentId, updateCommentDto, req.user);
  }

  @Delete('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete comment',
    description:
      'Delete a comment and all its replies. Only the comment author can delete their own comments.',
  })
  @ApiParam({ name: 'commentId', description: 'Comment UUID', type: 'string' })
  @ApiResponse({
    status: 204,
    description: 'Comment deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only delete your own comments',
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async deleteComment(
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Request() req,
  ) {
    await this.commentsService.remove(commentId, req.user);
  }

  @Get('users/:userId/comments')
  @ApiOperation({
    summary: 'Get user comments',
    description:
      'Retrieve all comments made by a specific user with pagination.',
  })
  @ApiParam({ name: 'userId', description: 'User UUID', type: 'string' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'User comments retrieved successfully',
    schema: {
      example: {
        comments: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            content: 'Great post! Thanks for sharing.',
            createdAt: '2024-01-15T10:30:00Z',
            post: {
              id: '789e0123-e89b-12d3-a456-426614174002',
              title: 'How to Build REST APIs',
              author: {
                username: 'techblogger',
              },
            },
            parentId: null,
          },
        ],
        total: 15,
        page: 1,
        limit: 10,
        totalPages: 2,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserComments(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    const result = await this.commentsService.findByUser(userId, page, limit);
    return {
      ...result,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }
}
