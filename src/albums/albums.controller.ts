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
import { AlbumsService } from './albums.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';

@ApiTags('Album')
@Controller('album')
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all albums' })
  @ApiResponse({
    status: 200,
    description: 'Return all albums',
  })
  findAll() {
    return this.albumsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get album by id' })
  @ApiResponse({
    status: 200,
    description: 'Return album by id',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. albumId is invalid (not uuid)',
  })
  @ApiResponse({
    status: 404,
    description: 'Album was not found',
  })
  findById(@Param('id') id: string) {
    return this.albumsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new album' })
  @ApiResponse({
    status: 201,
    description: 'Album has been created',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. body does not contain required fields',
  })
  create(@Body() dto: CreateAlbumDto) {
    return this.albumsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update album' })
  @ApiResponse({
    status: 200,
    description: 'Album has been updated',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. albumId is invalid (not uuid)',
  })
  @ApiResponse({
    status: 404,
    description: 'Album was not found',
  })
  update(@Param('id') id: string, @Body() dto: UpdateAlbumDto) {
    return this.albumsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete album' })
  @ApiResponse({
    status: 204,
    description: 'Album has been deleted',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. albumId is invalid (not uuid)',
  })
  @ApiResponse({
    status: 404,
    description: 'Album was not found',
  })
  remove(@Param('id') id: string) {
    this.albumsService.remove(id);
    return;
  }
}
