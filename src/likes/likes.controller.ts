import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('likes')
@Controller('likes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post('posts/:postId/like')
  @ApiOperation({ summary: 'Like a post' })
  @ApiResponse({ status: 201, description: 'Post liked successfully' })
  @ApiResponse({ status: 409, description: 'Post already liked' })
  likePost(@Param('postId') postId: string, @Request() req) {
    return this.likesService.likePost(postId, req.user);
  }

  @Delete('posts/:postId/like')
  @ApiOperation({ summary: 'Unlike a post' })
  @ApiResponse({ status: 200, description: 'Post unliked successfully' })
  @ApiResponse({ status: 404, description: 'Like not found' })
  unlikePost(@Param('postId') postId: string, @Request() req) {
    return this.likesService.unlikePost(postId, req.user);
  }

  @Get('posts/:postId/likes')
  @ApiOperation({ summary: 'Get post likes' })
  @ApiResponse({ status: 200, description: 'Likes retrieved successfully' })
  getPostLikes(
    @Param('postId') postId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.likesService.getPostLikes(postId, +page, +limit);
  }

  @Get('posts/:postId/check')
  @ApiOperation({ summary: 'Check if user liked post' })
  @ApiResponse({ status: 200, description: 'Like status retrieved' })
  checkUserLike(@Param('postId') postId: string, @Request() req) {
    return this.likesService.checkUserLike(postId, req.user.id);
  }
}
