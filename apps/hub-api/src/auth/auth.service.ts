import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { PhoneHashService } from '../phone/phone-hash.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
}

export interface AuthResponse {
  access_token: string;
  user: AuthUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly phoneHash: PhoneHashService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const normalized = this.phoneHash.normalize(dto.phone);

    const existing = await this.prisma.user.findUnique({ where: { phone: normalized } });
    if (existing) throw new ConflictException('Số điện thoại đã được đăng ký');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: { name: dto.name, phone: normalized, passwordHash },
      select: { id: true, name: true, phone: true },
    });

    return { access_token: this.sign(user), user };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const normalized = this.phoneHash.normalize(dto.phone);

    const user = await this.prisma.user.findUnique({ where: { phone: normalized } });
    if (!user) throw new UnauthorizedException('Số điện thoại hoặc mật khẩu không đúng');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Số điện thoại hoặc mật khẩu không đúng');

    const { id, name, phone } = user;
    return { access_token: this.sign({ id, name, phone }), user: { id, name, phone } };
  }

  private sign(user: AuthUser): string {
    return this.jwt.sign({ sub: user.id, phone: user.phone });
  }
}
