import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsDate, IsOptional, Matches } from 'class-validator';

export class RewardDTO {
    @ApiProperty({
        description: 'The unique identifier of the advertisement',
        example: '507f1f77bcf86cd799439011'
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[0-9a-fA-F]{24}$/, {
        message: 'adId must be a valid MongoDB ObjectId (24 hex characters)'
    })
    adId: string;

    @ApiProperty({
        description: 'The World ID of the user receiving the reward',
        example: 'user123'
    })
    @IsString()
    @IsNotEmpty()
    worldId: string;

    @ApiProperty({
        description: 'The amount rewarded',
        example: 100
    })
    @IsNumber()
    @IsNotEmpty()
    rewardedAmount: number;

    @ApiProperty({
        description: 'Timestamp when the reward was created',
        example: '2024-01-20T08:00:00Z'
    })
    @IsDate()
    @IsOptional()
    createdAt?: Date;

    @ApiProperty({
        description: 'Chain ID where the reward transaction occurred',
        required: false
    })
    @IsString()
    @IsOptional()
    chainId?: string;

    @ApiProperty({
        description: 'Transaction hash of the reward',
        required: false
    })
    @IsString()
    @IsOptional()
    txHash?: string;
}