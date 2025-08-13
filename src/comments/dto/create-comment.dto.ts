import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'Great post! Thanks for sharing.' })
  @IsNotEmpty()
  content: string;
}
