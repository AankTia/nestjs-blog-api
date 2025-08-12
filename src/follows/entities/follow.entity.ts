import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

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
