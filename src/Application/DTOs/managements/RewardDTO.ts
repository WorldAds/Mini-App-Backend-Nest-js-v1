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
        description: 'The user ID receiving the reward',
        example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
    })
    @IsString()
    @IsNotEmpty()
    userId: string;

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