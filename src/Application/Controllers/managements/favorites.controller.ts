import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  HttpStatus,
  Logger,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { FavoriteDTO } from 'src/Application/DTOs/managements/FavoriteDTO';
import { FavoriteService } from 'src/Domain/Services/Favorites/favorites.service';

@ApiTags('favorites')
@ApiBearerAuth()
@Controller('api/v1/favorites')
export class FavoriteController {
  private readonly logger = new Logger(FavoriteController.name);

  constructor(private readonly favoriteService: FavoriteService) {}

  @Post()
  @ApiOperation({ summary: 'Add an advertisement to favorites' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The advertisement has been successfully added to favorites.',
    type: FavoriteDTO,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Advertisement not found.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Advertisement is already in favorites.',
  })
  async addToFavorites(@Body() favoriteDto: FavoriteDTO) {
    this.logger.log(
      `Adding advertisement ${favoriteDto.adId} to favorites for user with World ID: ${favoriteDto.worldId}`,
    );
    return await this.favoriteService.addToFavorites(favoriteDto);
  }

  @Delete(':adId/:worldId')
  @ApiOperation({ summary: 'Remove an advertisement from favorites' })
  @ApiParam({
    name: 'adId',
    required: true,
    description: 'The ID of the advertisement',
  })
  @ApiParam({
    name: 'worldId',
    required: true,
    description: 'The World ID of the user',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description:
      'The advertisement has been successfully removed from favorites.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Favorite not found.',
  })
  async removeFromFavorites(
    @Param('adId') adId: string,
    @Param('worldId') worldId: string,
  ) {
    this.logger.log(
      `Removing advertisement ${adId} from favorites for user with World ID: ${worldId}`,
    );
    await this.favoriteService.removeFromFavorites(adId, worldId);
    return { statusCode: HttpStatus.NO_CONTENT };
  }

  @Get('user/:worldId')
  @ApiOperation({ summary: 'Get all favorites for a user' })
  @ApiParam({
    name: 'worldId',
    required: true,
    description: 'The World ID of the user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all favorites for the user',
    type: [FavoriteDTO],
  })
  async getUserFavorites(@Param('worldId') worldId: string) {
    this.logger.log(`Retrieving favorites for user with World ID: ${worldId}`);
    return await this.favoriteService.getUserFavorites(worldId);
  }

  @Get('ad/:adId')
  @ApiOperation({ summary: 'Get favorite count for an advertisement' })
  @ApiParam({
    name: 'adId',
    required: true,
    description: 'The ID of the advertisement',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Favorite count for the advertisement',
    type: Number,
  })
  async getAdFavoriteCount(@Param('adId') adId: string) {
    this.logger.log(`Retrieving favorite count for advertisement ${adId}`);
    return await this.favoriteService.getAdFavoriteCount(adId);
  }
}
