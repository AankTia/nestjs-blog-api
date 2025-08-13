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
import { FollowsService } from './follows.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('follows')
@Controller('follows')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post('users/:userId/follow')
  @ApiOperation({ summary: 'Follow a user' })
  @ApiResponse({ status: 201, description: 'User followed successfully' })
  @ApiResponse({ status: 409, description: 'Already following this user' })
  followUser(@Param('userId') userId: string, @Request() req) {
    return this.followsService.followUser(userId, req.user);
  }

  @Delete('users/:userId/follow')
  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiResponse({ status: 200, description: 'User unfollowed successfully' })
  @ApiResponse({ status: 404, description: 'Follow relationship not found' })
  unfollowUser(@Param('userId') userId: string, @Request() req) {
    return this.followsService.unfollowUser(userId, req.user);
  }

  @Get('users/:userId/followers')
  @ApiOperation({ summary: 'Get user followers' })
  @ApiResponse({ status: 200, description: 'Followers retrieved successfully' })
  getFollowers(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.followsService.getFollowers(userId, +page, +limit);
  }

  @Get('users/:userId/following')
  @ApiOperation({ summary: 'Get users being followed' })
  @ApiResponse({ status: 200, description: 'Following retrieved successfully' })
  getFollowing(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.followsService.getFollowing(userId, +page, +limit);
  }

  @Get('users/:userId/check')
  @ApiOperation({ summary: 'Check follow status' })
  @ApiResponse({ status: 200, description: 'Follow status retrieved' })
  checkFollowStatus(@Param('userId') userId: string, @Request() req) {
    return this.followsService.checkFollowStatus(req.user.id, userId);
  }
}
