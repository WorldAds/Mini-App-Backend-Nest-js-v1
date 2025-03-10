import { Controller, Post, Body, HttpStatus, Logger, Get, Param, Put, NotFoundException, Delete } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AdvertisementDTO } from 'src/Application/DTOs/managements/AdvertisementDTO';
import { AdvertisementService } from 'src/Domain/Services/Advertisements/ads.service';

@ApiTags('advertisements')
@ApiBearerAuth()
@Controller('api/v1/advertisements')
export class AdvertisementController {
  private readonly logger = new Logger(AdvertisementController.name);

  constructor(private readonly advertisementService: AdvertisementService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new advertisement' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The advertisement has been successfully created.',
    type: AdvertisementDTO,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Advertisement with this name already exists.',
  })
  async createAdvertisement(@Body() advertisementDto: AdvertisementDTO) {
    this.logger.log('Received request to create advertisement');
    const result =
      await this.advertisementService.createAdvertisement(advertisementDto);
    return result;
  }

  @Get()
  @ApiOperation({ summary: 'Get all advertisements' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all advertisements',
    type: [AdvertisementDTO]
  })
  async getAllAdvertisements() {
    this.logger.log('Received request to get all advertisements');
    const result = await this.advertisementService.getAllAdvertisements();
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get advertisement by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the advertisement',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The advertisement has been found',
    type: AdvertisementDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Advertisement not found',
  })
  async getAdvertisementById(@Param('id') id: string) {
    this.logger.log(`Received request to get advertisement with ID: ${id}`);
    const result = await this.advertisementService.getAdvertisementById(id);
    return result;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an advertisement' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the advertisement to update',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The advertisement has been successfully updated.',
    type: AdvertisementDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Advertisement not found.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Advertisement with this name already exists.',
  })
  async updateAdvertisement(
    @Param('id') id: string,
    @Body() advertisementDto: Partial<AdvertisementDTO>,
  ) {
    this.logger.log(`Received request to update advertisement with ID: ${id}`);
    const result = await this.advertisementService.updateAdvertisement(
      id,
      advertisementDto,
    );
    return result;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an advertisement' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the advertisement to delete',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The advertisement has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Advertisement not found.',
  })
  async deleteAdvertisement(@Param('id') id: string) {
    this.logger.log(`Received request to delete advertisement with ID: ${id}`);
    await this.advertisementService.deleteAdvertisement(id);
    return { statusCode: HttpStatus.NO_CONTENT };
  }
}
