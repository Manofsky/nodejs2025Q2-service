import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { randomUUID } from 'crypto';
import { validate as isUuid } from 'uuid';

@Injectable()
export class UsersService {
  private users: User[] = [];

  findAll(): Omit<User, 'password'>[] {
    // Return all users without password
    return this.users.map((user) => {
      const userCopy = { ...user };
      delete userCopy.password;
      return userCopy;
    });
  }

  findOne(id: string): Omit<User, 'password'> {
    if (!isUuid(id)) {
      throw new BadRequestException('Invalid userId');
    }
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Exclude password
    const userCopy = { ...user };
    delete userCopy.password;
    return userCopy;
  }

  create(dto: CreateUserDto): Omit<User, 'password'> {
    if (!dto.login || !dto.password) {
      throw new BadRequestException('Missing required fields');
    }
    const now = Date.now();
    const user: User = {
      id: randomUUID(),
      login: dto.login,
      password: dto.password,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    this.users.push(user);
    const userCopy = { ...user };
    delete userCopy.password;
    return userCopy;
  }

  updatePassword(
    id: string,
    oldPassword: string,
    newPassword: string,
  ): Omit<User, 'password'> {
    if (!isUuid(id)) {
      throw new BadRequestException('Invalid userId');
    }
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.password !== oldPassword) {
      throw new ForbiddenException('Old password is wrong');
    }
    user.password = newPassword;
    user.version += 1;
    user.updatedAt = Date.now();
    const userCopy = { ...user };
    delete userCopy.password;
    return userCopy;
  }

  remove(id: string): void {
    if (!isUuid(id)) {
      throw new BadRequestException('Invalid userId');
    }
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) {
      throw new NotFoundException('User not found');
    }
    this.users.splice(idx, 1);
  }
}
