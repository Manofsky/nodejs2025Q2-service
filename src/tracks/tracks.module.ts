import { Module, forwardRef } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { TracksController } from './tracks.controller';
import { ArtistsModule } from '../artists/artists.module';

@Module({
  imports: [forwardRef(() => ArtistsModule)],
  controllers: [TracksController],
  providers: [TracksService],
  exports: [TracksService],
})
export class TracksModule {}
