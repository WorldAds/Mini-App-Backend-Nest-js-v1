import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDate, IsArray, IsEnum, IsUrl } from 'class-validator';
import { CreativeType } from '../../../Domain/ValueObjects/CreativeType';

export class AdvertisementDTO {
    @ApiProperty({ description: 'The name of the advertisement' })
    @IsString()
    adsName: string;

    @ApiProperty({ description: 'The budget allocated for the advertisement' })
    @IsNumber()
    budget: number;

    @ApiProperty({ description: 'The start date of the advertisement campaign' })
    @IsDate()
    startDate: Date;

    @ApiProperty({ description: 'The end date of the advertisement campaign' })
    @IsDate()
    endDate: Date;

    @ApiProperty({ description: 'The target audience for the advertisement' })
    @IsString()
    targetAudience: string;

    @ApiProperty({ 
        description: 'The locations where the advertisement will be shown',
        type: [String]
    })
    @IsArray()
    @IsString({ each: true })
    locations: string[];

    @ApiProperty({ 
        description: 'The type of creative content',
        enum: CreativeType
    })
    @IsEnum(CreativeType)
    creativeType: CreativeType;

    @ApiProperty({ description: 'The URL of the creative content' })
    @IsUrl()
    creativeURL: string;
}
