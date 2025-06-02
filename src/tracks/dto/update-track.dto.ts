import { IsString, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class UpdateTrackDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsUUID(4)
  artistId?: string | null;

  @IsOptional()
  @IsUUID(4)
  albumId?: string | null;

  @IsNumber()
  @Min(1)
  duration: number;
}
