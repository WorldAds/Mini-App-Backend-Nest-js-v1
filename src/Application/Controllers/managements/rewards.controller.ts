import { Controller, Post, Get, Body, Param, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { RewardDTO } from 'src/Application/DTOs/managements/RewardDTO';
import { RewardService } from 'src/Domain/Services/Rewards/rewards.service';

@ApiTags('rewards')
@ApiBearerAuth()
@Controller('api/v1/rewards')
export class RewardController {
    private readonly logger = new Logger(RewardController.name);

    constructor(private readonly rewardService: RewardService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new reward' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'The reward has been successfully created.',
        type: RewardDTO,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data.',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Advertisement not found.',
    })
    async createReward(@Body() rewardDto: RewardDTO): Promise<RewardDTO> {
        this.logger.log(`Creating reward for user with World ID: ${rewardDto.worldId} for ad ${rewardDto.adId}`);
        return await this.rewardService.createReward(rewardDto);
    }

    @Get('user/:worldId')
    @ApiOperation({ summary: 'Get all rewards for a user' })
    @ApiParam({
        name: 'worldId',
        required: true,
        description: 'The World ID of the user',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of all rewards for the user',
        type: [RewardDTO],
    })
    async getUserRewards(@Param('worldId') worldId: string): Promise<RewardDTO[]> {
        this.logger.log(`Retrieving rewards for user with World ID: ${worldId}`);
        return await this.rewardService.getUserRewards(worldId);
    }

    @Get('ad/:adId')
    @ApiOperation({ summary: 'Get all rewards for an advertisement' })
    @ApiParam({
        name: 'adId',
        required: true,
        description: 'The ID of the advertisement',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of all rewards for the advertisement',
        type: [RewardDTO],
    })
    async getAdRewards(@Param('adId') adId: string): Promise<RewardDTO[]> {
        this.logger.log(`Retrieving rewards for advertisement ${adId}`);
        return await this.rewardService.getAdRewards(adId);
    }

    @Get('user/:worldId/total')
    @ApiOperation({ summary: 'Get total rewards for a user' })
    @ApiParam({
        name: 'worldId',
        required: true,
        description: 'The World ID of the user',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Total rewards amount for the user',
        type: Number,
    })
    async getUserTotalRewards(@Param('worldId') worldId: string): Promise<number> {
        this.logger.log(`Retrieving total rewards for user with World ID: ${worldId}`);
        return await this.rewardService.getUserTotalRewards(worldId);
    }

    @Get('ad/:adId/total')
    @ApiOperation({ summary: 'Get total rewards for an advertisement' })
    @ApiParam({
        name: 'adId',
        required: true,
        description: 'The ID of the advertisement',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Total rewards amount for the advertisement',
        type: Number,
    })
    async getAdTotalRewards(@Param('adId') adId: string): Promise<number> {
        this.logger.log(`Retrieving total rewards for advertisement ${adId}`);
        return await this.rewardService.getAdTotalRewards(adId);
    }
}