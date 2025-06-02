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
import { randomUUID } from 'crypto';
import { validate as isUuid } from 'uuid';
import { TracksService } from '../tracks/tracks.service';
import { AlbumsService } from '../albums/albums.service';

@Injectable()
export class ArtistsService {
  private artists: Artist[] = [];

  constructor(
    @Inject(forwardRef(() => TracksService))
    private tracksService: TracksService,
    @Inject(forwardRef(() => AlbumsService))
    private albumsService: AlbumsService,
  ) {}

  findAll(): Artist[] {
    return this.artists;
  }

  findOne(id: string): Artist {
    if (!isUuid(id)) {
      throw new BadRequestException('Invalid artistId');
    }
    const artist = this.artists.find((a) => a.id === id);
    if (!artist) {
      throw new NotFoundException('Artist not found');
    }
    return artist;
  }

  create(dto: CreateArtistDto): Artist {
    const artist: Artist = {
      id: randomUUID(),
      name: dto.name,
      grammy: dto.grammy,
    };
    this.artists.push(artist);
    return artist;
  }

  update(id: string, dto: UpdateArtistDto): Artist {
    if (!isUuid(id)) {
      throw new BadRequestException('Invalid artistId');
    }
    const artist = this.artists.find((a) => a.id === id);
    if (!artist) {
      throw new NotFoundException('Artist not found');
    }

    // Update artist properties
    artist.name = dto.name;
    artist.grammy = dto.grammy;

    return artist;
  }

  remove(id: string): void {
    if (!isUuid(id)) {
      throw new BadRequestException('Invalid artistId');
    }
    const idx = this.artists.findIndex((a) => a.id === id);
    if (idx === -1) {
      throw new NotFoundException('Artist not found');
    }
    // Update tracks associated with this artist
    const tracks = this.tracksService.findAll();
    for (const track of tracks) {
      if (track.artistId === id) {
        track.artistId = null;
      }
    }

    // Update albums associated with this artist
    const albums = this.albumsService.findAll();
    for (const album of albums) {
      if (album.artistId === id) {
        album.artistId = null;
      }
    }
    this.artists.splice(idx, 1);
  }
}
