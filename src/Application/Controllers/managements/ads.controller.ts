import { Controller, Post, Body, HttpStatus, Logger } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdvertisementDTO } from '../../DTOs/managements/AdvertisementDTO';
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
}
