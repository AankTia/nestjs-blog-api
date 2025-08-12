import { RegisterDto } from './dto/register.dto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user
    };
  }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(RegisterDto.password, 10);
    const user = await this.usersService.create({
      ...RegisterDto,
      password: hashedPassword
    });
    const { password, ...result } = user;
    return this.login(result);
  }
}