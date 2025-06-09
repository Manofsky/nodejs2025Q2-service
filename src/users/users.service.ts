import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { validate as isUuid } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.prisma.user.findMany();
    return users.map((user) => {
      const userEntity = this.mapToEntity(user);
      const userCopy = { ...userEntity };
      delete userCopy.password;
      return userCopy;
    });
  }

  async findOne(id: string): Promise<Omit<User, 'password'>> {
    if (!isUuid(id)) {
      throw new BadRequestException('Invalid userId');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userEntity = this.mapToEntity(user);
    const userCopy = { ...userEntity };
    delete userCopy.password;
    return userCopy;
  }

  async create(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    try {
      const user = await this.prisma.user.create({
        data: {
          login: dto.login,
          password: dto.password,
        },
      });

      const userEntity = this.mapToEntity(user);
      const userCopy = { ...userEntity };
      delete userCopy.password;
      return userCopy;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('User with this login already exists');
      }
      throw error;
    }
  }

  async updatePassword(
    id: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<Omit<User, 'password'>> {
    if (!isUuid(id)) {
      throw new BadRequestException('Invalid userId');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.password !== oldPassword) {
      throw new ForbiddenException('Old password is wrong');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        password: newPassword,
        version: { increment: 1 },
      },
    });

    const userEntity = this.mapToEntity(updatedUser);
    const userCopy = { ...userEntity };
    delete userCopy.password;
    return userCopy;
  }

  async remove(id: string): Promise<void> {
    if (!isUuid(id)) {
      throw new BadRequestException('Invalid userId');
    }

    try {
      await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }

  private mapToEntity(prismaUser: any): User {
    return {
      id: prismaUser.id,
      login: prismaUser.login,
      password: prismaUser.password,
      version: prismaUser.version,
      createdAt: prismaUser.createdAt.getTime(),
      updatedAt: prismaUser.updatedAt.getTime(),
    };
  }
}
