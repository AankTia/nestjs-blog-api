import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, isNotEmpty } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'username123' })
  @isNotEmpty()
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
