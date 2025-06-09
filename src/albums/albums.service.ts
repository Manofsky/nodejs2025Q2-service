import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Album } from './album.entity';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { validate as isUuid } from 'uuid';
import { TracksService } from '../tracks/tracks.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlbumsService {
  constructor(
    @Inject(forwardRef(() => TracksService))
    private tracksService: TracksService,
    private prisma: PrismaService,
  ) {}

  async findAll(): Promise<Album[]> {
    const albums = await this.prisma.album.findMany();
    return albums.map((album) => this.mapToEntity(album));
  }

  async findOne(id: string): Promise<Album> {
    if (!isUuid(id)) {
      throw new BadRequestException('Invalid albumId');
    }

    const album = await this.prisma.album.findUnique({
      where: { id },
    });

    if (!album) {
      throw new NotFoundException('Album not found');
    }

    return this.mapToEntity(album);
  }

  async create(dto: CreateAlbumDto): Promise<Album> {
    const album = await this.prisma.album.create({
      data: {
        name: dto.name,
        year: dto.year,
        artistId: dto.artistId || null,
      },
    });

    return this.mapToEntity(album);
  }

  async update(id: string, dto: UpdateAlbumDto): Promise<Album> {
    if (!isUuid(id)) {
      throw new BadRequestException('Invalid albumId');
    }

    try {
      // Сначала получаем текущий альбом, чтобы сохранить artistId, если он не указан в dto
      const currentAlbum = await this.prisma.album.findUnique({
        where: { id },
      });

      if (!currentAlbum) {
        throw new NotFoundException('Album not found');
      }

      const album = await this.prisma.album.update({
        where: { id },
        data: {
          name: dto.name,
          year: dto.year,
          artistId:
            dto.artistId !== undefined ? dto.artistId : currentAlbum.artistId,
        },
      });

      return this.mapToEntity(album);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Album not found');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    if (!isUuid(id)) {
      throw new BadRequestException('Invalid albumId');
    }

    try {
      // Обновляем треки, связанные с этим альбомом
      await this.prisma.track.updateMany({
        where: { albumId: id },
        data: { albumId: null },
      });

      await this.prisma.album.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Album not found');
      }
      throw error;
    }
  }

  private mapToEntity(prismaAlbum: any): Album {
    return {
      id: prismaAlbum.id,
      name: prismaAlbum.name,
      year: prismaAlbum.year,
      artistId: prismaAlbum.artistId,
    };
  }
}
