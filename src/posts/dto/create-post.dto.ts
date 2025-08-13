import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'My First Blog Post' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'This is the content of my first blop post...' })
  @IsNotEmpty()
  content: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  image?: string;
}
