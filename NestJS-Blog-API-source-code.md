# NestJS Blog API Source

## `package.json`

```json
{
  "name": "nestjs-blog-api",
  "version": "1.0.0",
  "description": "Advanced Blog REST API with NestJS",
  "author": "Your Name",
  "private": true,
  "license": "MIT",
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "migration:generate": "typeorm-ts-node-commonjs migration:generate -d src/database/data-source.ts",
    "migration:run": "typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts",
    "migration:revert": "typeorm-ts-node-commonjs migration:revert -d src/database/data-source.ts",
    "seed": "ts-node src/database/seeds/seed.ts"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/jwt": "^10.1.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/swagger": "^7.1.2",
    "@nestjs/throttler": "^4.2.1",
    "@nestjs/typeorm": "^10.0.0",
    "@faker-js/faker": "^8.0.2",
    "bcrypt": "^5.1.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "ioredis": "^5.3.2",
    "multer": "^1.4.5-lts.1",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "pg": "^8.11.1",
    "redis": "^4.6.7",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1",
    "typeorm": "^0.3.17"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/bcrypt": "^5.0.0",
    "@types/express": "^4.17.17",
    "@types/jest": "^29.5.2",
    "@types/multer": "^1.4.7",
    "@types/node": "^20.3.1",
    "@types/passport-jwt": "^3.0.9",
    "@types/passport-local": "^1.0.35",
    "@types/supertest": "^2.0.12",
    "@typescript-eslint/eslint-plugin": "^5.59.11",
    "@typescript-eslint/parser": "^5.59.11",
    "eslint": "^8.42.0",
    "eslint-config-prettier": "^8.8.0",
    "eslint-plugin-prettier": "^4.2.1",
    "jest": "^29.5.0",
    "prettier": "^2.8.8",
    "source-map-support": "^0.5.21",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.0",
    "ts-loader": "^9.4.3",
    "ts-node": "^10.9.1",
    "tsconfig-paths": "^4.2.1",
    "typescript": "^5.1.3"
  }
}
```

## `.env`

```
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=bloguser
DATABASE_PASSWORD=blogpassword
DATABASE_NAME=blogdb
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1d
UPLOAD_DEST=./uploads
MAX_FILE_SIZE=5242880
PORT=3000
NODE_ENV=development
```

## `src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Blog API')
    .setDescription('Advanced Blog REST API with NestJS')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application running on port ${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
}

bootstrap();
```

## `src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { FollowsModule } from './follows/follows.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    DatabaseModule,
    AuthModule,
    UsersModule,
    PostsModule,
    CommentsModule,
    LikesModule,
    FollowsModule,
    UploadsModule,
  ],
})
export class AppModule {}
```

## `src/database/database.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Post } from '../posts/entities/post.entity';
import { Comment } from '../comments/entities/comment.entity';
import { Like } from '../likes/entities/like.entity';
import { Follow } from '../follows/entities/follow.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [User, Post, Comment, Like, Follow],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
```

## `src/users/entities/user.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Post } from '../../posts/entities/post.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Like } from '../../likes/entities/like.entity';
import { Follow } from '../../follows/entities/follow.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true, length: 500 })
  bio: string;

  @Column({ default: 0 })
  followersCount: number;

  @Column({ default: 0 })
  followingCount: number;

  @Column({ default: 0 })
  postsCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @OneToMany(() => Follow, (follow) => follow.follower)
  following: Follow[];

  @OneToMany(() => Follow, (follow) => follow.following)
  followers: Follow[];
}
```

## `src/posts/entities/post.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Like } from '../../likes/entities/like.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  image: string;

  @Column({ default: 0 })
  likesCount: number;

  @Column({ default: 0 })
  commentsCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.posts, { eager: true })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorId: string;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];
}
```

## `src/comments/entities/comment.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.comments, { eager: true })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorId: string;

  @ManyToOne(() => Post, (post) => post.comments)
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column()
  postId: string;

  @ManyToOne(() => Comment, (comment) => comment.replies, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: Comment;

  @Column({ nullable: true })
  parentId: string;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies: Comment[];
}
```

## `src/likes/entities/like.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';

@Entity('likes')
@Unique(['userId', 'postId'])
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.likes)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Post, (post) => post.likes)
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column()
  postId: string;
}
```

## `src/follows/entities/follow.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Column,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('follows')
@Unique(['followerId', 'followingId'])
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.following)
  @JoinColumn({ name: 'followerId' })
  follower: User;

  @Column()
  followerId: string;

  @ManyToOne(() => User, (user) => user.followers)
  @JoinColumn({ name: 'followingId' })
  following: User;

  @Column()
  followingId: string;
}
```

## `src/auth/auth.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

## `src/auth/strategies/local.strategy.ts`

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
```

## `src/auth/strategies/jwt.strategy.ts`

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```

## `src/auth/auth.service.ts`

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import \* as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
constructor(
private usersService: UsersService,
private jwtService: JwtService,
) {}

async validateUser(email: string, password: string): Promise<any> {
const user = await this.usersService.findByEmail(email);
if (user && await bcrypt.compare(password, user.password)) {
const { password, ...result } = user;
return result;
}
return null;
}

async login(user: any) {
const payload = { email: user.email, sub: user.id };
return {
access_token: this.jwtService.sign(payload),
user,
};
}

async register(registerDto: RegisterDto) {
const hashedPassword = await bcrypt.hash(registerDto.password, 10);
const user = await this.usersService.create({
...registerDto,
password: hashedPassword,
});
const { password, ...result } = user;
return this.login(result);
}

async refreshToken(user: any) {
return this.login(user);
}
}
```

// src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// src/comments/comments.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('comments')
@Controller()
export class CommentsController {
constructor(private readonly commentsService: CommentsService) {}

@Post('posts/:postId/comments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Add comment to post' })
@ApiResponse({ status: 201, description: 'Comment added successfully' })
@ApiResponse({ status: 404, description: 'Post not found' })
create(
@Param('postId') postId: string,
@Body() createCommentDto: CreateCommentDto,
@Request() req
) {
return this.commentsService.create(postId, createCommentDto, req.user);
}

@Post('comments/:id/reply')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Reply to comment' })
@ApiResponse({ status: 201, description: 'Reply added successfully' })
@ApiResponse({ status: 404, description: 'Comment not found' })
reply(
@Param('id') commentId: string,
@Body() createCommentDto: CreateCommentDto,
@Request() req
) {
return this.commentsService.createReply(commentId, createCommentDto, req.user);
}

@Get('posts/:postId/comments')
@ApiOperation({ summary: 'Get post comments' })
@ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
@ApiResponse({ status: 404, description: 'Post not found' })
findByPost(
@Param('postId') postId: string,
@Query('page') page: string = '1',
@Query('limit') limit: string = '10'
) {
return this.commentsService.findByPost(postId, +page, +limit);
}

@Get('comments/:id')
@ApiOperation({ summary: 'Get single comment with replies' })
@ApiResponse({ status: 200, description: 'Comment found' })
@ApiResponse({ status: 404, description: 'Comment not found' })
findOne(@Param('id') id: string) {
return this.commentsService.findOne(id);
}

@Patch('comments/:id')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Update comment' })
@ApiResponse({ status: 200, description: 'Comment updated successfully' })
@ApiResponse({ status: 403, description: 'Can only update your own comments' })
@ApiResponse({ status: 404, description: 'Comment not found' })
update(
@Param('id') id: string,
@Body() updateCommentDto: UpdateCommentDto,
@Request() req
) {
return this.commentsService.update(id, updateCommentDto, req.user);
}

@Delete('comments/:id')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Delete comment' })
@ApiResponse({ status: 200, description: 'Comment deleted successfully' })
@ApiResponse({ status: 403, description: 'Can only delete your own comments' })
@ApiResponse({ status: 404, description: 'Comment not found' })
remove(@Param('id') id: string, @Request() req) {
return this.commentsService.remove(id, req.user);
}

@Get('comments/:id/replies')
@ApiOperation({ summary: 'Get comment replies' })
@ApiResponse({ status: 200, description: 'Replies retrieved successfully' })
@ApiResponse({ status: 404, description: 'Comment not found' })
getReplies(
@Param('id') commentId: string,
@Query('page') page: string = '1',
@Query('limit') limit: string = '10'
) {
return this.commentsService.getReplies(commentId, +page, +limit);
}
}

// src/comments/dto/create-comment.dto.ts
import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
@ApiProperty({ example: 'Great post! Thanks for sharing.' })
@IsNotEmpty()
content: string;
}

// src/comments/dto/update-comment.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateCommentDto } from './create-comment.dto';

export class UpdateCommentDto extends PartialType(CreateCommentDto) {}

// src/likes/likes.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { Like } from './entities/like.entity';
import { PostsModule } from '../posts/posts.module';

@Module({
imports: [
TypeOrmModule.forFeature([Like]),
PostsModule,
],
controllers: [LikesController],
providers: [LikesService],
exports: [LikesService],
})
export class LikesModule {}

// src/likes/likes.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { User } from '../users/entities/user.entity';
import { PostsService } from '../posts/posts.service';

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

async getPostLikes(postId: string, page: number = 1, limit: number = 10): Promise<{ likes: Like[]; total: number }> {
const [likes, total] = await this.likesRepository.findAndCount({
where: { postId },
skip: (page - 1) \* limit,
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

// src/likes/likes.controller.ts
import { Controller, Post, Delete, Param, UseGuards, Request, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
@Query('limit') limit: string = '10'
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

// src/follows/follows.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { Follow } from './entities/follow.entity';
import { UsersModule } from '../users/users.module';

@Module({
imports: [
TypeOrmModule.forFeature([Follow]),
UsersModule,
],
controllers: [FollowsController],
providers: [FollowsService],
exports: [FollowsService],
})
export class FollowsModule {}

// src/follows/follows.service.ts
import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class FollowsService {
constructor(
@InjectRepository(Follow)
private followsRepository: Repository<Follow>,
private usersService: UsersService,
) {}

async followUser(followingId: string, follower: User): Promise<{ message: string }> {
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

async unfollowUser(followingId: string, follower: User): Promise<{ message: string }> {
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

async getFollowers(userId: string, page: number = 1, limit: number = 10): Promise<{ followers: User[]; total: number }> {
const [follows, total] = await this.followsRepository.findAndCount({
where: { followingId: userId },
skip: (page - 1) \* limit,
take: limit,
order: { createdAt: 'DESC' },
relations: ['follower'],
});

    const followers = follows.map(follow => follow.follower);
    return { followers, total };

}

async getFollowing(userId: string, page: number = 1, limit: number = 10): Promise<{ following: User[]; total: number }> {
const [follows, total] = await this.followsRepository.findAndCount({
where: { followerId: userId },
skip: (page - 1) \* limit,
take: limit,
order: { createdAt: 'DESC' },
relations: ['following'],
});

    const following = follows.map(follow => follow.following);
    return { following, total };

}

async checkFollowStatus(followerId: string, followingId: string): Promise<boolean> {
const follow = await this.followsRepository.findOne({
where: { followerId, followingId },
});

    return !!follow;

}
}

// src/follows/follows.controller.ts
import { Controller, Post, Delete, Get, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
@Query('limit') limit: string = '10'
) {
return this.followsService.getFollowers(userId, +page, +limit);
}

@Get('users/:userId/following')
@ApiOperation({ summary: 'Get users being followed' })
@ApiResponse({ status: 200, description: 'Following retrieved successfully' })
getFollowing(
@Param('userId') userId: string,
@Query('page') page: string = '1',
@Query('limit') limit: string = '10'
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

// src/uploads/uploads.module.ts
import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

@Module({
controllers: [UploadsController],
providers: [UploadsService],
exports: [UploadsService],
})
export class UploadsModule {}

// src/uploads/uploads.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import _ as fs from 'fs/promises';
import _ as path from 'path';

@Injectable()
export class UploadsService {
constructor(private configService: ConfigService) {}

async uploadFile(file: Express.Multer.File): Promise<{ filename: string; url: string }> {
const uploadDir = this.configService.get<string>('UPLOAD_DEST', './uploads');

    // Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    const filepath = path.join(uploadDir, filename);

    await fs.writeFile(filepath, file.buffer);

    return {
      filename,
      url: `/uploads/${filename}`,
    };

}

async deleteFile(filename: string): Promise<void> {
const uploadDir = this.configService.get<string>('UPLOAD_DEST', './uploads');
const filepath = path.join(uploadDir, filename);

    try {
      await fs.unlink(filepath);
    } catch (error) {
      // File doesn't exist or already deleted
      console.warn(`Could not delete file: ${filepath}`, error.message);
    }

}

getFileUrl(filename: string): string {
return `/uploads/${filename}`;
}
}

// src/uploads/uploads.controller.ts
import { Controller, Post, UseInterceptors, UploadedFile, Get, Param, Res, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
constructor(private readonly uploadsService: UploadsService) {}

@Post()
@UseGuards(JwtAuthGuard)
@UseInterceptors(FileInterceptor('file', {
storage: diskStorage({
destination: './uploads',
filename: (req, file, callback) => {
const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() _ 1E9);
callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
},
}),
fileFilter: (req, file, callback) => {
if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
return callback(new Error('Only image files are allowed!'), false);
}
callback(null, true);
},
limits: {
fileSize: 5 _ 1024 \* 1024, // 5MB
},
}))
@ApiBearerAuth()
@ApiConsumes('multipart/form-data')
@ApiOperation({ summary: 'Upload a file' })
@ApiResponse({ status: 201, description: 'File uploaded successfully' })
uploadFile(@UploadedFile() file: Express.Multer.File) {
return {
filename: file.filename,
url: `/uploads/${file.filename}`,
originalName: file.originalname,
size: file.size,
};
}

@Get(':filename')
@ApiOperation({ summary: 'Serve uploaded file' })
@ApiResponse({ status: 200, description: 'File served' })
serveFile(@Param('filename') filename: string, @Res() res: Response) {
const filePath = join(process.cwd(), 'uploads', filename);
return res.sendFile(filePath);
}
}

// src/database/seeds/seed.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { UsersService } from '../../users/users.service';
import { PostsService } from '../../posts/posts.service';
import { CommentsService } from '../../comments/comments.service';
import { LikesService } from '../../likes/likes.service';
import { FollowsService } from '../../follows/follows.service';
import { faker } from '@faker-js/faker';
import \* as bcrypt from 'bcrypt';

async function bootstrap() {
const app = await NestFactory.createApplicationContext(AppModule);

const usersService = app.get(UsersService);
const postsService = app.get(PostsService);
const commentsService = app.get(CommentsService);
const likesService = app.get(LikesService);
const followsService = app.get(FollowsService);

console.log('🌱 Starting database seeding...');

// Create users
console.log('Creating users...');
const users = [];
const hashedPassword = await bcrypt.hash('password123', 10);

for (let i = 0; i < 20; i++) {
try {
const user = await usersService.create({
email: faker.internet.email(),
username: faker.internet.userName().toLowerCase(),
password: hashedPassword,
firstName: faker.person.firstName(),
lastName: faker.person.lastName(),
bio: faker.lorem.sentence(),
avatar: faker.image.avatar(),
});
users.push(user);
} catch (error) {
console.log('User creation failed, retrying...');
i--; // Retry if username/email already exists
}
}
console.log(`✅ Created ${users.length} users`);

// Create follows
console.log('Creating follow relationships...');
let followCount = 0;
for (let i = 0; i < users.length; i++) {
const follower = users[i];
const followingCount = faker.number.int({ min: 1, max: 8 });

    for (let j = 0; j < followingCount; j++) {
      const randomUser = faker.helpers.arrayElement(users);
      if (randomUser.id !== follower.id) {
        try {
          await followsService.followUser(randomUser.id, follower);
          followCount++;
        } catch (error) {
          // Already following, skip
        }
      }
    }

}
console.log(`✅ Created ${followCount} follow relationships`);

// Create posts
console.log('Creating posts...');
const posts = [];
for (let i = 0; i < 100; i++) {
const author = faker.helpers.arrayElement(users);
const post = await postsService.create(
{
title: faker.lorem.sentence(),
content: faker.lorem.paragraphs(faker.number.int({ min: 2, max: 5 })),
},
author,
);
posts.push(post);
}
console.log(`✅ Created ${posts.length} posts`);

// Create comments
console.log('Creating comments...');
let commentCount = 0;
for (const post of posts) {
const numComments = faker.number.int({ min: 0, max: 10 });
for (let i = 0; i < numComments; i++) {
const commenter = faker.helpers.arrayElement(users);
await commentsService.create(
post.id,
{ content: faker.lorem.sentences() },
commenter,
);
commentCount++;
}
}
console.log(`✅ Created ${commentCount} comments`);

// Create likes
console.log('Creating likes...');
let likeCount = 0;
for (const post of posts) {
const numLikes = faker.number.int({ min: 0, max: 15 });
const likers = faker.helpers.arrayElements(users, numLikes);

    for (const liker of likers) {
      try {
        await likesService.likePost(post.id, liker);
        likeCount++;
      } catch (error) {
        // Already liked, skip
      }
    }

}
console.log(`✅ Created ${likeCount} likes`);

console.log('🎉 Database seeding completed!');
console.log('\n📊 Summary:');
console.log(`👥 Users: ${users.length}`);
console.log(`🤝 Follows: ${followCount}`);
console.log(`📝 Posts: ${posts.length}`);
console.log(`💬 Comments: ${commentCount}`);
console.log(`❤️ Likes: ${likeCount}`);

await app.close();
}

bootstrap().catch((error) => {
console.error('Seeding failed:', error);
process.exit(1);
});

// docker-compose.yml
version: '3.8'

services:
postgres:
image: postgres:15
container_name: blog_postgres
restart: unless-stopped
environment:
POSTGRES_DB: blogdb
POSTGRES_USER: bloguser
POSTGRES_PASSWORD: blogpassword
POSTGRES_HOST_AUTH_METHOD: trust
ports: - "5432:5432"
volumes: - postgres_data:/var/lib/postgresql/data - ./init.sql:/docker-entrypoint-initdb.d/init.sql
networks: - blog_network
healthcheck:
test: ["CMD-SHELL", "pg_isready -U bloguser -d blogdb"]
interval: 30s
timeout: 10s
retries: 5

redis:
image: redis:7-alpine
container_name: blog_redis
restart: unless-stopped
ports: - "6379:6379"
volumes: - redis_data:/data
networks: - blog_network
healthcheck:
test: ["CMD", "redis-cli", "ping"]
interval: 30s
timeout: 10s
retries: 5

api:
build:
context: .
dockerfile: Dockerfile
container_name: blog_api
restart: unless-stopped
ports: - "3000:3000"
depends_on:
postgres:
condition: service_healthy
redis:
condition: service_healthy
environment:
DATABASE_HOST: postgres
DATABASE_PORT: 5432
DATABASE_USER: bloguser
DATABASE_PASSWORD: blogpassword
DATABASE_NAME: blogdb
REDIS_HOST: redis
REDIS_PORT: 6379
JWT_SECRET: your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN: 1d
UPLOAD_DEST: ./uploads
MAX_FILE_SIZE: 5242880
PORT: 3000
NODE_ENV: production
volumes: - ./uploads:/app/uploads - app_node_modules:/app/node_modules
networks: - blog_network

volumes:
postgres_data:
redis_data:
app_node_modules:

networks:
blog_network:
driver: bridge

# Dockerfile

FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files

COPY package\*.json ./

# Install dependencies

RUN npm ci --only=production && npm cache clean --force

# Copy source code

COPY . .

# Build the application

RUN npm run build

# Production stage

FROM node:18-alpine AS production

WORKDIR /app

# Copy package files

COPY package\*.json ./

# Install only production dependencies

RUN npm ci --only=production && npm cache clean --force

# Copy built application

COPY --from=builder /app/dist ./dist

# Create uploads directory

RUN mkdir -p uploads

# Expose port

EXPOSE 3000

# Health check

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
 CMD node healthcheck.js

# Start the application

CMD ["npm", "run", "start:prod"]

# .dockerignore

node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.coverage
.eslintrc.js
.prettierrc
test
uploads/\*
!uploads/.gitkeep

# healthcheck.js

const http = require('http');

const options = {
hostname: 'localhost',
port: 3000,
path: '/api',
method: 'GET',
timeout: 2000,
};

const request = http.request(options, (res) => {
if (res.statusCode >= 200 && res.statusCode < 300) {
process.exit(0);
} else {
process.exit(1);
}
});

request.on('error', () => {
process.exit(1);
});

request.on('timeout', () => {
request.destroy();
process.exit(1);
});

request.end();Tags('auth')
@Controller('auth')
export class AuthController {
constructor(private readonly authService: AuthService) {}

@UseGuards(LocalAuthGuard)
@Post('login')
@ApiOperation({ summary: 'User login' })
@ApiResponse({ status: 200, description: 'Login successful' })
@ApiResponse({ status: 401, description: 'Invalid credentials' })
async login(@Body() loginDto: LoginDto, @Request() req) {
return this.authService.login(req.user);
}

@Post('register')
@ApiOperation({ summary: 'User registration' })
@ApiResponse({ status: 201, description: 'User registered successfully' })
@ApiResponse({ status: 400, description: 'Bad request' })
async register(@Body() registerDto: RegisterDto) {
return this.authService.register(registerDto);
}

@UseGuards(JwtAuthGuard)
@Post('refresh')
@ApiBearerAuth()
@ApiOperation({ summary: 'Refresh JWT token' })
@ApiResponse({ status: 200, description: 'Token refreshed' })
async refreshToken(@Request() req) {
return this.authService.refreshToken(req.user);
}
}

## `src/auth/dto/login.dto.ts`

```typescript
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  password: string;
}
```

## `src/auth/dto/register.dto.ts`

```typescript
import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'username123' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    example: 'Software developer from Indonesia',
    required: false,
  })
  @IsOptional()
  bio?: string;
}
```

## `src/auth/guards/jwt-auth.guard.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

## `src/auth/guards/local-auth.guard.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
```

## `src/users/users.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

## `src/users/users.service.ts`

```typescript
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

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
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return await this.usersRepository.findOne({ where: { email } });
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
```

## `src/users/users.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved' })
  getProfile(@Request() req) {
    return req.user;
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Get(':username')
  @ApiOperation({ summary: 'Get user by username' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findByUsername(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }
}
```

## `src/users/dto/create-user.dto.ts`

```typescript
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ required: false })
  @IsOptional()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  bio?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  avatar?: string;
}
```

## `src/users/dto/update-user.dto.ts`

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  bio?: string;

  @IsOptional()
  avatar?: string;
}
```

## `src/posts/posts.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post } from './entities/post.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), UsersModule],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
```

## `src/posts/posts.service.ts`

```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { User } from '../users/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class PostsService {
constructor(
@InjectRepository(Post)
private postsRepository: Repository<Post>,
private usersService: UsersService,
) {}

async create(createPostDto: CreatePostDto, user: User): Promise<Post> {
const post = this.postsRepository.create({
...createPostDto,
authorId: user.id,
});

    const savedPost = await this.postsRepository.save(post);
    await this.usersService.updateCounts(user.id, 'postsCount', true);

    return savedPost;

}

async findAll(page: number = 1, limit: number = 10): Promise<{ posts: Post[]; total: number }> {
const [posts, total] = await this.postsRepository.findAndCount({
skip: (page - 1) \* limit,
take: limit,
order: { createdAt: 'DESC' },
relations: ['author'],
});

    return { posts, total };

}

async findOne(id: string): Promise<Post> {
const post = await this.postsRepository.findOne({
where: { id },
relations: ['author'],
});

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;

}

async findByAuthor(authorId: string, page: number = 1, limit: number = 10): Promise<{ posts: Post[]; total: number }> {
const [posts, total] = await this.postsRepository.findAndCount({
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

    await this.postsRepository.update(id, updatePostDto);
    return this.findOne(id);

}

async remove(id: string, user: User): Promise<void> {
const post = await this.findOne(id);

    if (post.authorId !== user.id) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.postsRepository.delete(id);
    await this.usersService.updateCounts(user.id, 'postsCount', false);

}

async updateCounts(postId: string, field: 'likesCount' | 'commentsCount', increment: boolean) {
const operator = increment ? '+' : '-';
await this.postsRepository
.createQueryBuilder()
.update(Post)
.set({ [field]: () => `${field} ${operator} 1` })
.where('id = :postId', { postId })
.execute();
}
}
```

## `src/posts/posts.controller.ts`

```typescript
import {
Controller,
Get,
Post,
Body,
Patch,
Param,
Delete,
UseGuards,
Request,
Query,
UseInterceptors,
UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
constructor(private readonly postsService: PostsService) {}

@Post()
@UseGuards(JwtAuthGuard)
@UseInterceptors(FileInterceptor('image', {
storage: diskStorage({
destination: './uploads',
filename: (req, file, callback) => {
const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() _ 1E9);
callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
},
}),
fileFilter: (req, file, callback) => {
if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
return callback(new Error('Only image files are allowed!'), false);
}
callback(null, true);
},
limits: {
fileSize: 5 _ 1024 \* 1024, // 5MB
},
}))
@ApiBearerAuth()
@ApiConsumes('multipart/form-data')
@ApiOperation({ summary: 'Create a new post' })
@ApiResponse({ status: 201, description: 'Post created successfully' })
create(
@Body() createPostDto: CreatePostDto,
@UploadedFile() file: Express.Multer.File,
@Request() req
) {
const postData = {
...createPostDto,
image: file ? file.filename : null,
};
return this.postsService.create(postData, req.user);
}

@Get()
@ApiOperation({ summary: 'Get all posts' })
@ApiResponse({ status: 200, description: 'Posts retrieved successfully' })
findAll(
@Query('page') page: string = '1',
@Query('limit') limit: string = '10'
) {
return this.postsService.findAll(+page, +limit);
}

@Get(':id')
@ApiOperation({ summary: 'Get a single post' })
@ApiResponse({ status: 200, description: 'Post found' })
@ApiResponse({ status: 404, description: 'Post not found' })
findOne(@Param('id') id: string) {
return this.postsService.findOne(id);
}

@Patch(':id')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Update a post' })
@ApiResponse({ status: 200, description: 'Post updated successfully' })
update(
@Param('id') id: string,
@Body() updatePostDto: UpdatePostDto,
@Request() req
) {
return this.postsService.update(id, updatePostDto, req.user);
}

@Delete(':id')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Delete a post' })
@ApiResponse({ status: 200, description: 'Post deleted successfully' })
remove(@Param('id') id: string, @Request() req) {
return this.postsService.remove(id, req.user);
}

@Get('user/:username')
@ApiOperation({ summary: 'Get posts by user' })
@ApiResponse({ status: 200, description: 'User posts retrieved' })
findByUser(
@Param('username') username: string,
@Query('page') page: string = '1',
@Query('limit') limit: string = '10'
) {
// This would need to be implemented to get user ID from username first
// For now, assuming it's user ID
return this.postsService.findByAuthor(username, +page, +limit);
}
}
```

## `src/posts/dto/create-post.dto.ts`

```typescript
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'My First Blog Post' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'This is the content of my first blog post...' })
  @IsNotEmpty()
  content: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  image?: string;
}
```

## `src/posts/dto/update-post.dto.ts`

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends PartialType(CreatePostDto) {}
```

## src/comments/comments.module.ts

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from './entities/comment.entity';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), PostsModule],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
```

## `src/comments/comments.service.ts`

```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class CommentsService {
constructor(
@InjectRepository(Comment)
private commentsRepository: Repository<Comment>,
private postsService: PostsService,
) {}

async create(postId: string, createCommentDto: CreateCommentDto, user: User): Promise<Comment> {
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

async createReply(commentId: string, createCommentDto: CreateCommentDto, user: User): Promise<Comment> {
const parentComment = await this.commentsRepository.findOne({
where: { id: commentId },
relations: ['post'],
});

    if (!parentComment) {
      throw new NotFoundException('Comment not found');
    }

    const comment = this.commentsRepository.create({
      ...createCommentDto,
      postId: parentComment.postId,
      parentId: commentId,
      authorId: user.id,
    });

    const savedComment = await this.commentsRepository.save(comment);
    await this.postsService.updateCounts(parentComment.postId, 'commentsCount', true);

    return savedComment;

}

async findByPost(postId: string, page: number = 1, limit: number = 10): Promise<{ comments: Comment[]; total: number }> {
const [comments, total] = await this.commentsRepository.findAndCount({
where: { postId, parentId: null }, // Only top-level comments
skip: (page - 1) \* limit,
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

async update(id: string, updateCommentDto: UpdateCommentDto, user: User): Promise<Comment> {
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
    await this.postsService.updateCounts(comment.postId, 'commentsCount', false);

}

async getReplies(commentId: string, page: number = 1, limit: number = 10): Promise<{ replies: Comment[]; total: number }> {
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
```

## `src/comments/comments.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('comments')
@Controller()
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
```
