import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class UpdateAlbumDto {
  @IsString()
  name: string;

  @IsNumber()
  year: number;

  @IsOptional()
  @IsUUID(4)
  artistId?: string | null;
}
