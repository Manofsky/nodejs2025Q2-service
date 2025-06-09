import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Track } from './track.entity';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { validate as isUuid } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TracksService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Track[]> {
    const tracks = await this.prisma.track.findMany();
    return tracks.map((track) => this.mapToEntity(track));
  }

  async findOne(id: string): Promise<Track> {
    if (!isUuid(id)) {
      throw new BadRequestException('Invalid trackId');
    }

    const track = await this.prisma.track.findUnique({
      where: { id },
    });

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    return this.mapToEntity(track);
  }

  async create(dto: CreateTrackDto): Promise<Track> {
    const track = await this.prisma.track.create({
      data: {
        name: dto.name,
        artistId: dto.artistId || null,
        albumId: dto.albumId || null,
        duration: dto.duration,
      },
    });

    return this.mapToEntity(track);
  }

  async update(id: string, dto: UpdateTrackDto): Promise<Track> {
    if (!isUuid(id)) {
      throw new BadRequestException('Invalid trackId');
    }

    try {
      // Сначала получаем текущий трек, чтобы сохранить artistId и albumId, если они не указаны в dto
      const currentTrack = await this.prisma.track.findUnique({
        where: { id },
      });

      if (!currentTrack) {
        throw new NotFoundException('Track not found');
      }

      const track = await this.prisma.track.update({
        where: { id },
        data: {
          name: dto.name,
          artistId:
            dto.artistId !== undefined ? dto.artistId : currentTrack.artistId,

          albumId:
            dto.albumId !== undefined ? dto.albumId : currentTrack.albumId,
          duration: dto.duration,
        },
      });

      return this.mapToEntity(track);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Track not found');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    if (!isUuid(id)) {
      throw new BadRequestException('Invalid trackId');
    }

    try {
      await this.prisma.track.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Track not found');
      }
      throw error;
    }
  }

  private mapToEntity(prismaTrack: any): Track {
    return {
      id: prismaTrack.id,
      name: prismaTrack.name,
      artistId: prismaTrack.artistId,
      albumId: prismaTrack.albumId,
      duration: prismaTrack.duration,
    };
  }
}
