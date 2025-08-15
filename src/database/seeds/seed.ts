import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { UsersService } from '../../users/users.service';
import { PostsService } from '../../posts/posts.service';
import { CommentsService } from '../../comments/comments.service';
import { LikesService } from '../../likes/likes.service';
import { FollowsService } from '../../follows/follows.service';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

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
  type User = {
    id: string;
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    bio: string;
    avatar: string;
    // Add any other properties your user entity includes
  };

  const users: User[] = [];
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
    } catch {
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
          const fullFollower = await usersService.findOne(follower.id);
          await followsService.followUser(randomUser.id, fullFollower);
          followCount++;
        } catch {
          // Already following, skip
        }
      }
    }
  }
  console.log(`✅ Created ${followCount} follow relationships`);

  // Create posts
  console.log('Creating posts...');
  type Post = {
    id: string;
    // Add other properties if needed
  };
  const posts: Post[] = [];
  for (let i = 0; i < 100; i++) {
    const authorSeed = faker.helpers.arrayElement(users);
    const author = await usersService.findOne(authorSeed.id); // Fetch full user entity
    const post = await postsService.create(
      {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(faker.number.int({ min: 2, max: 5 })),
      },
      author,
    );
    posts.push(post as Post);
  }
  console.log(`✅ Created ${posts.length} posts`);

  // Create comments
  console.log('Creating comments...');
  let commentCount = 0;
  for (const post of posts) {
    const numComments = faker.number.int({ min: 0, max: 10 });
    for (let i = 0; i < numComments; i++) {
      const commenterSeed = faker.helpers.arrayElement(users);
      const commenter = await usersService.findOne(commenterSeed.id); // Fetch full user entity
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
        const fullLiker = await usersService.findOne(liker.id); // Fetch full user entity
        await likesService.likePost(post.id, fullLiker);
        likeCount++;
      } catch {
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
