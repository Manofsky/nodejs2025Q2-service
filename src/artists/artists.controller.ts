import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ArtistsService } from './artists.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';

@ApiTags('Artist')
@Controller('artist')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all artists' })
  @ApiResponse({
    status: 200,
    description: 'Return all artists',
  })
  async findAll() {
    return this.artistsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get artist by id' })
  @ApiResponse({
    status: 200,
    description: 'Return artist by id',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. artistId is invalid (not uuid)',
  })
  @ApiResponse({
    status: 404,
    description: 'Artist was not found',
  })
  async findById(@Param('id') id: string) {
    return this.artistsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new artist' })
  @ApiResponse({
    status: 201,
    description: 'Artist has been created',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. body does not contain required fields',
  })
  async create(@Body() dto: CreateArtistDto) {
    return this.artistsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update artist' })
  @ApiResponse({
    status: 200,
    description: 'Artist has been updated',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. artistId is invalid (not uuid)',
  })
  @ApiResponse({
    status: 404,
    description: 'Artist was not found',
  })
  async update(@Param('id') id: string, @Body() dto: UpdateArtistDto) {
    return this.artistsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete artist' })
  @ApiResponse({
    status: 204,
    description: 'Artist has been deleted',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. artistId is invalid (not uuid)',
  })
  @ApiResponse({
    status: 404,
    description: 'Artist was not found',
  })
  async remove(@Param('id') id: string) {
    await this.artistsService.remove(id);
    return;
  }
}
