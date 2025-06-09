import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Artist } from './artist.entity';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { validate as isUuid } from 'uuid';
import { TracksService } from '../tracks/tracks.service';
import { AlbumsService } from '../albums/albums.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ArtistsService {
  constructor(
    @Inject(forwardRef(() => TracksService))
    private tracksService: TracksService,
    @Inject(forwardRef(() => AlbumsService))
    private albumsService: AlbumsService,
    private prisma: PrismaService,
  ) {}

  async findAll(): Promise<Artist[]> {
    const artists = await this.prisma.artist.findMany();
    return artists.map((artist) => this.mapToEntity(artist));
  }

  async findOne(id: string): Promise<Artist> {
    if (!isUuid(id)) {
      throw new BadRequestException('Invalid artistId');
    }

    const artist = await this.prisma.artist.findUnique({
      where: { id },
    });

    if (!artist) {
      throw new NotFoundException('Artist not found');
    }

    return this.mapToEntity(artist);
  }

  async create(dto: CreateArtistDto): Promise<Artist> {
    const artist = await this.prisma.artist.create({
      data: {
        name: dto.name,
        grammy: dto.grammy,
      },
    });

    return this.mapToEntity(artist);
  }

  async update(id: string, dto: UpdateArtistDto): Promise<Artist> {
    if (!isUuid(id)) {
      throw new BadRequestException('Invalid artistId');
    }

    try {
      const artist = await this.prisma.artist.update({
        where: { id },
        data: {
          name: dto.name,
          grammy: dto.grammy,
        },
      });

      return this.mapToEntity(artist);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Artist not found');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    if (!isUuid(id)) {
      throw new BadRequestException('Invalid artistId');
    }

    try {
      // Update tracks associated with this artist
      await this.prisma.track.updateMany({
        where: { artistId: id },
        data: { artistId: null },
      });

      // Update albums associated with this artist
      await this.prisma.album.updateMany({
        where: { artistId: id },
        data: { artistId: null },
      });

      await this.prisma.artist.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Artist not found');
      }
      throw error;
    }
  }

  private mapToEntity(prismaArtist: any): Artist {
    return {
      id: prismaArtist.id,
      name: prismaArtist.name,
      grammy: prismaArtist.grammy,
    };
  }
}
