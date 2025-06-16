import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { LoggingService } from '../logging/logging.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private loggingService: LoggingService,
  ) {}

  async signup(authDto: AuthDto) {
    const { login, password } = authDto;

    // Validate DTO
    if (
      !login ||
      !password ||
      typeof login !== 'string' ||
      typeof password !== 'string'
    ) {
      throw new BadRequestException('Invalid login or password');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    try {
      // Create user with hashed password
      await this.prisma.user.create({
        data: {
          login,
          password: hashedPassword,
        },
      });

      this.loggingService.info(`User created: ${login}`);

      return {
        statusCode: 201,
        message: 'User created successfully',
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('User with this login already exists');
      }
      throw error;
    }
  }

  async login(authDto: AuthDto) {
    const { login, password } = authDto;

    // Validate DTO
    if (
      !login ||
      !password ||
      typeof login !== 'string' ||
      typeof password !== 'string'
    ) {
      throw new BadRequestException('Invalid login or password');
    }

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { login },
    });

    if (!user) {
      throw new ForbiddenException('Invalid login or password');
    }

    // Verify password
    const isPasswordValid = await this.comparePasswords(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new ForbiddenException('Invalid login or password');
    }

    // Generate tokens
    const tokens = await this.getTokens(user.id, user.login);

    this.loggingService.info(`User logged in: ${login}`);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async refresh(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_SECRET_REFRESH_KEY || 'super-secret',
      });

      // Extract user info from payload
      const { sub: userId, login } = payload;

      // Generate new tokens
      const tokens = await this.getTokens(userId, login);

      this.loggingService.info(`Token refreshed for user: ${login}`);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      this.loggingService.error(`Token refresh failed: ${error.message}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getTokens(userId: string, login: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          login,
        },
        {
          secret: process.env.JWT_SECRET_KEY || 'super-secret',
          expiresIn: process.env.TOKEN_EXPIRE_TIME || '1h',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          login,
        },
        {
          secret: process.env.JWT_SECRET_REFRESH_KEY || 'super-secret',
          expiresIn: process.env.TOKEN_REFRESH_EXPIRE_TIME || '24h',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
