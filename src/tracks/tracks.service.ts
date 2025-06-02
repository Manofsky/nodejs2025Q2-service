import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Track } from './track.entity';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { randomUUID } from 'crypto';
import { validate as isUuid } from 'uuid';

@Injectable()
export class TracksService {
  private tracks: Track[] = [];

  findAll(): Track[] {
    return this.tracks;
  }

  findOne(id: string): Track {
    if (!isUuid(id)) {
      throw new BadRequestException('Invalid trackId');
    }
    const track = this.tracks.find((t) => t.id === id);
    if (!track) {
      throw new NotFoundException('Track not found');
    }
    return track;
  }

  create(dto: CreateTrackDto): Track {
    const track: Track = {
      id: randomUUID(),
      name: dto.name,
      artistId: dto.artistId || null,
      albumId: dto.albumId || null,
      duration: dto.duration,
    };
    this.tracks.push(track);
    return track;
  }

  update(id: string, dto: UpdateTrackDto): Track {
    if (!isUuid(id)) {
      throw new BadRequestException('Invalid trackId');
    }
    const track = this.tracks.find((t) => t.id === id);
    if (!track) {
      throw new NotFoundException('Track not found');
    }

    // Update track properties
    track.name = dto.name;
    track.artistId = dto.artistId !== undefined ? dto.artistId : track.artistId;
    track.albumId = dto.albumId !== undefined ? dto.albumId : track.albumId;
    track.duration = dto.duration;

    return track;
  }

  remove(id: string): void {
    if (!isUuid(id)) {
      throw new BadRequestException('Invalid trackId');
    }
    const idx = this.tracks.findIndex((t) => t.id === id);
    if (idx === -1) {
      throw new NotFoundException('Track not found');
    }
    this.tracks.splice(idx, 1);
  }
}
