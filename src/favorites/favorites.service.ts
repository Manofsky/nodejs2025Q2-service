import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Favorites } from './favorites.entity';
import { validate as isUuid } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Favorites> {
    // Получаем все избранные записи из базы данных
    const favoriteArtists = await this.prisma.favoriteArtist.findMany();
    const favoriteAlbums = await this.prisma.favoriteAlbum.findMany();
    const favoriteTracks = await this.prisma.favoriteTrack.findMany();

    // Получаем полные объекты для каждого ID
    const artists = await Promise.all(
      favoriteArtists.map(async (fa) => {
        const artist = await this.prisma.artist.findUnique({
          where: { id: fa.artistId },
        });
        return artist;
      }),
    );

    const albums = await Promise.all(
      favoriteAlbums.map(async (fa) => {
        const album = await this.prisma.album.findUnique({
          where: { id: fa.albumId },
        });
        return album;
      }),
    );

    const tracks = await Promise.all(
      favoriteTracks.map(async (ft) => {
        const track = await this.prisma.track.findUnique({
          where: { id: ft.trackId },
        });
        return track;
      }),
    );

    // Создаем и возвращаем объект Favorites с полными объектами
    return {
      artists: artists.filter(Boolean),
      albums: albums.filter(Boolean),
      tracks: tracks.filter(Boolean),
    };
  }

  async addArtist(artistId: string): Promise<void> {
    if (!isUuid(artistId)) {
      throw new BadRequestException('Invalid artistId');
    }

    try {
      // Проверяем, существует ли артист
      const artist = await this.prisma.artist.findUnique({
        where: { id: artistId },
      });

      if (!artist) {
        throw new UnprocessableEntityException('Artist not found');
      }

      // Добавляем артиста в избранное
      await this.prisma.favoriteArtist.create({
        data: {
          artistId,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        // Unique constraint violation - уже в избранном
        return;
      }
      throw error;
    }
  }

  async removeArtist(artistId: string): Promise<void> {
    if (!isUuid(artistId)) {
      throw new BadRequestException('Invalid artistId');
    }

    try {
      // Удаляем артиста из избранного
      await this.prisma.favoriteArtist.delete({
        where: {
          artistId,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Artist not found in favorites');
      }
      throw error;
    }
  }

  async addAlbum(albumId: string): Promise<void> {
    if (!isUuid(albumId)) {
      throw new BadRequestException('Invalid albumId');
    }

    try {
      // Проверяем, существует ли альбом
      const album = await this.prisma.album.findUnique({
        where: { id: albumId },
      });

      if (!album) {
        throw new UnprocessableEntityException('Album not found');
      }

      // Добавляем альбом в избранное
      await this.prisma.favoriteAlbum.create({
        data: {
          albumId,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        // Unique constraint violation - уже в избранном
        return;
      }
      throw error;
    }
  }

  async removeAlbum(albumId: string): Promise<void> {
    if (!isUuid(albumId)) {
      throw new BadRequestException('Invalid albumId');
    }

    try {
      // Удаляем альбом из избранного
      await this.prisma.favoriteAlbum.delete({
        where: {
          albumId,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Album not found in favorites');
      }
      throw error;
    }
  }

  async addTrack(trackId: string): Promise<void> {
    if (!isUuid(trackId)) {
      throw new BadRequestException('Invalid trackId');
    }

    try {
      // Проверяем, существует ли трек
      const track = await this.prisma.track.findUnique({
        where: { id: trackId },
      });

      if (!track) {
        throw new UnprocessableEntityException('Track not found');
      }

      // Добавляем трек в избранное
      await this.prisma.favoriteTrack.create({
        data: {
          trackId,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        // Unique constraint violation - уже в избранном
        return;
      }
      throw error;
    }
  }

  async removeTrack(trackId: string): Promise<void> {
    if (!isUuid(trackId)) {
      throw new BadRequestException('Invalid trackId');
    }

    try {
      // Удаляем трек из избранного
      await this.prisma.favoriteTrack.delete({
        where: {
          trackId,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Track not found in favorites');
      }
      throw error;
    }
  }
}
