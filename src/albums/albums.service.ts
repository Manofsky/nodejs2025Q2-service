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
import { randomUUID } from 'crypto';
import { validate as isUuid } from 'uuid';
import { TracksService } from '../tracks/tracks.service';

@Injectable()
export class AlbumsService {
  constructor(
    @Inject(forwardRef(() => TracksService))
    private tracksService: TracksService,
  ) {}
  private albums: Album[] = [];

  findAll(): Album[] {
    return this.albums;
  }

  findOne(id: string): Album {
    if (!isUuid(id)) {
      throw new BadRequestException('Invalid albumId');
    }
    const album = this.albums.find((a) => a.id === id);
    if (!album) {
      throw new NotFoundException('Album not found');
    }
    return album;
  }

  create(dto: CreateAlbumDto): Album {
    const album: Album = {
      id: randomUUID(),
      name: dto.name,
      year: dto.year,
      artistId: dto.artistId || null,
    };
    this.albums.push(album);
    return album;
  }

  update(id: string, dto: UpdateAlbumDto): Album {
    if (!isUuid(id)) {
      throw new BadRequestException('Invalid albumId');
    }
    const album = this.albums.find((a) => a.id === id);
    if (!album) {
      throw new NotFoundException('Album not found');
    }

    // Update album properties
    album.name = dto.name;
    album.year = dto.year;
    album.artistId = dto.artistId !== undefined ? dto.artistId : album.artistId;

    return album;
  }

  remove(id: string): void {
    if (!isUuid(id)) {
      throw new BadRequestException('Invalid albumId');
    }
    const idx = this.albums.findIndex((a) => a.id === id);
    if (idx === -1) {
      throw new NotFoundException('Album not found');
    }

    // Обновляем треки, связанные с этим альбомом
    const tracks = this.tracksService.findAll();
    for (const track of tracks) {
      if (track.albumId === id) {
        track.albumId = null;
      }
    }

    this.albums.splice(idx, 1);
  }
}
