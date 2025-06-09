import { Artist } from '../artists/artist.entity';
import { Album } from '../albums/album.entity';
import { Track } from '../tracks/track.entity';

export class Favorites {
  artists: Artist[] = [];
  albums: Album[] = [];
  tracks: Track[] = [];
}
