import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEthereumAddress, IsDate, IsOptional, Matches } from 'class-validator';

export class FavoriteDTO {
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
        description: 'The Ethereum wallet address of the user',
        example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
    })
    @IsEthereumAddress()
    @IsNotEmpty()
    userAddress: string;

    @ApiProperty({
        description: 'Timestamp when the favorite was created',
        example: '2024-01-20T08:00:00Z'
    })
    @IsDate()
    @IsOptional()
    createdAt?: Date;

    @ApiProperty({
        description: 'Optional note or comment about the favorite',
        example: 'Interesting campaign for future reference',
        required: false
    })
    @IsString()
    @IsOptional()
    note?: string;
}
