import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsUrl, IsNumber, IsOptional } from 'class-validator';
import { AvatarType } from '../../../Domain/ValueObjects/AvatarType';

export class UserDTO {
    @ApiProperty({ description: 'The World ID of the user' })
    @IsString()
    worldId: string;

    @ApiProperty({ description: 'The nickname of the user' })
    @IsString()
    nickname: string;

    @ApiProperty({ 
        description: 'The type of avatar',
        enum: AvatarType
    })
    @IsEnum(AvatarType)
    avatarType: AvatarType;

    @ApiProperty({ description: 'The URL of the avatar' })
    @IsUrl()
    avatarUrl: string;

    @ApiProperty({ description: 'The wallet address of the user' })
    @IsString()
    walletAddress: string;

    @ApiProperty({ description: 'The wallet balance of the user' })
    @IsNumber()
    walletBalance: number;
}

export class CreateUserDTO {
    @ApiProperty({ description: 'The World ID of the user' })
    @IsString()
    worldId: string;

    @ApiProperty({ description: 'The nickname of the user' })
    @IsString()
    nickname: string;

    @ApiProperty({ description: 'The wallet address of the user' })
    @IsString()
    walletAddress: string;
}

export class LoginUserDTO {
    @ApiProperty({ description: 'The World ID of the user' })
    @IsString()
    worldId: string;

    @ApiProperty({ description: 'The wallet address of the user' })
    @IsString()
    walletAddress: string;
}

export class UpdateAvatarDTO {
    @ApiProperty({ 
        description: 'The type of avatar',
        enum: AvatarType
    })
    @IsEnum(AvatarType)
    avatarType: AvatarType;

    @ApiProperty({ description: 'The URL of the avatar' })
    @IsUrl()
    avatarUrl: string;
}

export class UpdateNicknameDTO {
    @ApiProperty({ description: 'The nickname of the user' })
    @IsString()
    nickname: string;
}

export class UpdateWalletBalanceDTO {
    @ApiProperty({ description: 'The wallet balance of the user' })
    @IsNumber()
    walletBalance: number;
}
