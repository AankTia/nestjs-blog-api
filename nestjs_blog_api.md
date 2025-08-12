# Advanced Blog Post REST API with NestJS

A comprehensive blog API built with NestJS, PostgreSQL, and Redis featuring user management, social interactions, and image uploads.

## Features

- 🔐 User authentication with JWT
- 👥 User follow/unfollow system
- 📝 Create, read, update, delete posts
- 💬 Comment system with replies
- ❤️ Like/unlike functionality
- 🖼️ Image upload for posts
- 📊 Redis caching for performance
- 📚 API documentation with Swagger
- 🐳 Full Docker containerization
- 🌱 Database seeding with Faker

## Tech Stack

- **Backend**: NestJS, TypeScript
- **Database**: PostgreSQL
- **Cache**: Redis
- **Authentication**: JWT
- **File Upload**: Multer
- **API Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose

## Quick Start

1. Clone the repository

```bash
git clone <repository-url>
cd nestjs-blog-api
```

2. Start the application

```bash
docker-compose up --build
```

3. Access the API

- API: http://localhost:3000
- Swagger Documentation: http://localhost:3000/api
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Project Structure

```
src/
├── auth/                 # Authentication module
├── users/               # User management
├── posts/               # Blog posts
├── comments/            # Comments system
├── likes/               # Like system
├── follows/             # Follow system
├── uploads/             # File upload handling
├── common/              # Shared utilities
├── database/            # Database configuration
└── main.ts              # Application entry point
```

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh JWT token

### Users

- `GET /users/profile` - Get current user profile
- `PUT /users/profile` - Update profile
- `POST /users/:id/follow` - Follow user
- `DELETE /users/:id/follow` - Unfollow user
- `GET /users/:id/followers` - Get user followers
- `GET /users/:id/following` - Get users being followed

### Posts

- `GET /posts` - Get all posts (paginated)
- `POST /posts` - Create new post
- `GET /posts/:id` - Get single post
- `PUT /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post
- `POST /posts/:id/like` - Like post
- `DELETE /posts/:id/like` - Unlike post

### Comments

- `POST /posts/:id/comments` - Add comment to post
- `GET /posts/:id/comments` - Get post comments
- `POST /comments/:id/reply` - Reply to comment
- `PUT /comments/:id` - Update comment
- `DELETE /comments/:id` - Delete comment

## Environment Variables

Create a `.env` file:

```env
# Database
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=bloguser
DATABASE_PASSWORD=blogpassword
DATABASE_NAME=blogdb

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1d

# File Upload
UPLOAD_DEST=./uploads
MAX_FILE_SIZE=5242880

# App
PORT=3000
NODE_ENV=development
```

## Database Schema

The application uses the following main entities:

- **User**: User accounts with profile information
- **Post**: Blog posts with content and images
- **Comment**: Comments on posts with reply functionality
- **Like**: User likes on posts
- **Follow**: User follow relationships

## Development

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)

### Local Development Setup

1. Install dependencies:

```bash
npm install
```

2. Start database services:

```bash
docker-compose up postgres redis -d
```

3. Run migrations:

```bash
npm run migration:run
```

4. Seed the database:

```bash
npm run seed
```

5. Start development server:

```bash
npm run start:dev
```

### Available Scripts

- `npm run start:dev` - Start development server
- `npm run build` - Build production bundle
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run migration:generate` - Generate new migration
- `npm run migration:run` - Run pending migrations
- `npm run seed` - Seed database with fake data

## Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Run database migrations
docker-compose exec api npm run migration:run

# Seed database
docker-compose exec api npm run seed
```

## API Documentation

The API is fully documented using Swagger/OpenAPI. After starting the application, visit:
http://localhost:3000/api

## Testing

The project includes comprehensive test suites:

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Performance Features

- **Redis Caching**: Caches frequently accessed data
- **Database Indexing**: Optimized queries with proper indexes
- **Pagination**: Efficient data loading with cursor-based pagination
- **File Upload Optimization**: Multer with size limits and type validation

## Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Input validation using class-validator
- CORS configuration
- Rate limiting
- File upload security

## Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Docker Production

```bash
# Use production docker-compose
docker-compose -f docker-compose.prod.yml up --build -d
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check the [API documentation](http://localhost:3000/api)
2. Review the logs: `docker-compose logs -f`
3. Open an issue on GitHub

## Roadmap

- [ ] Real-time notifications with WebSockets
- [ ] Advanced search functionality
- [ ] Content moderation system
- [ ] Email notifications
- [ ] Social media integration
- [ ] Advanced analytics dashboard

---

## Step-by-Step Implementation Guide

### Step 1: Project Setup

1. Create new NestJS project:

```bash
npm i -g @nestjs/cli
nest new nestjs-blog-api
cd nestjs-blog-api
```

2. Install required dependencies:

```bash
npm install @nestjs/typeorm @nestjs/jwt @nestjs/passport @nestjs/swagger @nestjs/config @nestjs/throttler
npm install typeorm pg redis ioredis bcrypt passport passport-jwt passport-local
npm install multer class-validator class-transformer
npm install --save-dev @types/bcrypt @types/passport-jwt @types/passport-local @types/multer
```

### Step 2: Database Configuration

Create `src/database/database.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
        autoLoadEntities: true,
        synchronize: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
```

### Step 3: Create Entities

Create user entity `src/users/entities/user.entity.ts`:

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Post } from '../../posts/entities/post.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Like } from '../../likes/entities/like.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  bio: string;

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

  @ManyToMany(() => User, (user) => user.following)
  @JoinTable({ name: 'user_follows' })
  followers: User[];

  @ManyToMany(() => User, (user) => user.followers)
  following: User[];
}
```

### Step 4: Authentication Module

Create JWT strategy `src/auth/strategies/jwt.strategy.ts`:

```typescript
import { Injectable } from '@nestjs/common';
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
    return await this.usersService.findOne(payload.sub);
  }
}
```

### Step 5: Posts Module with Image Upload

Create post entity `src/posts/entities/post.entity.ts`:

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
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

  @ManyToOne(() => User, (user) => user.posts)
  author: User;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];
}
```

### Step 6: Docker Configuration

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: blog_postgres
    environment:
      POSTGRES_DB: blogdb
      POSTGRES_USER: bloguser
      POSTGRES_PASSWORD: blogpassword
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - blog_network

  redis:
    image: redis:7-alpine
    container_name: blog_redis
    ports:
      - '6379:6379'
    networks:
      - blog_network

  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: blog_api
    ports:
      - '3000:3000'
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_USER: bloguser
      DATABASE_PASSWORD: blogpassword
      DATABASE_NAME: blogdb
      REDIS_HOST: redis
      REDIS_PORT: 6379
      JWT_SECRET: your-super-secret-jwt-key
      JWT_EXPIRES_IN: 1d
    volumes:
      - ./uploads:/app/uploads
    networks:
      - blog_network

volumes:
  postgres_data:

networks:
  blog_network:
    driver: bridge
```

### Step 7: Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

### Step 8: Seed Script

Create `src/database/seeds/seed.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { UsersService } from '../../users/users.service';
import { PostsService } from '../../posts/posts.service';
import { faker } from '@faker-js/faker';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const usersService = app.get(UsersService);
  const postsService = app.get(PostsService);

  // Create users
  const users = [];
  for (let i = 0; i < 10; i++) {
    const user = await usersService.create({
      email: faker.internet.email(),
      username: faker.internet.userName(),
      password: 'password123',
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      bio: faker.lorem.sentence(),
    });
    users.push(user);
  }

  // Create posts
  for (let i = 0; i < 50; i++) {
    await postsService.create(
      {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(3),
      },
      faker.helpers.arrayElement(users),
    );
  }

  console.log('Seeding completed!');
  await app.close();
}

bootstrap().catch(console.error);
```

This comprehensive implementation provides all the requested features with proper architecture, security, and documentation. The step-by-step guide ensures you can build this system incrementally while understanding each component.
