import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsUrl, IsOptional, IsNumber, Min, IsDate } from 'class-validator';
import { CommentType } from '../../../Domain/ValueObjects/CommentType';
import { ReactionType } from '../../../Domain/ValueObjects/ReactionType';
import { Type } from 'class-transformer';

// Base Comment DTO
export class CommentDTO {
    @ApiProperty({ description: 'The ID of the comment' })
    @IsString()
    _id: string;

    @ApiProperty({ description: 'The ID of the advertisement' })
    @IsString()
    advertisementId: string;

    @ApiProperty({ description: 'The ID of the user who created the comment' })
    @IsString()
    userId: string;

    @ApiProperty({ description: 'The content of the comment' })
    @IsString()
    content: string;

    @ApiProperty({
        description: 'The type of comment',
        enum: CommentType
    })
    @IsEnum(CommentType)
    commentType: CommentType;

    @ApiProperty({
        description: 'The URL of the media (image or video)',
        required: false
    })
    @IsOptional()
    @IsUrl()
    mediaUrl?: string;

    @ApiProperty({ description: 'The date and time when the comment was created' })
    @IsDate()
    createdAt: Date;

    @ApiProperty({ description: 'The date and time when the comment was last updated' })
    @IsDate()
    updatedAt: Date;

    @ApiProperty({ description: 'The number of likes' })
    @IsNumber()
    likeCount: number;

    @ApiProperty({ description: 'The number of dislikes' })
    @IsNumber()
    dislikeCount: number;

    @ApiProperty({ description: 'The number of replies' })
    @IsNumber()
    replyCount: number;
}

// Create Comment DTO
export class CreateCommentDTO {
    @ApiProperty({ description: 'The ID of the advertisement' })
    @IsString()
    advertisementId: string;

    @ApiProperty({ description: 'The World ID of the user creating the comment' })
    @IsString()
    worldId: string;

    @ApiProperty({ description: 'The content of the comment' })
    @IsString()
    content: string;

    @ApiProperty({
        description: 'The type of comment',
        enum: CommentType
    })
    @IsEnum(CommentType)
    commentType: CommentType;

    @ApiProperty({
        description: 'The URL of the media (image or video)',
        required: false
    })
    @IsOptional()
    @IsUrl()
    mediaUrl?: string;
}

// Update Comment DTO
export class UpdateCommentDTO {
    @ApiProperty({ description: 'The content of the comment' })
    @IsString()
    content: string;

    @ApiProperty({
        description: 'The type of comment',
        enum: CommentType
    })
    @IsEnum(CommentType)
    commentType: CommentType;

    @ApiProperty({
        description: 'The URL of the media (image or video)',
        required: false
    })
    @IsOptional()
    @IsUrl()
    mediaUrl?: string;
}

// Reply DTO
export class ReplyDTO {
    @ApiProperty({ description: 'The ID of the reply' })
    @IsString()
    _id: string;

    @ApiProperty({ description: 'The ID of the parent comment' })
    @IsString()
    commentId: string;

    @ApiProperty({ description: 'The ID of the user who created the reply' })
    @IsString()
    userId: string;

    @ApiProperty({ description: 'The content of the reply' })
    @IsString()
    content: string;

    @ApiProperty({
        description: 'The type of reply',
        enum: CommentType
    })
    @IsEnum(CommentType)
    commentType: CommentType;

    @ApiProperty({
        description: 'The URL of the media (image or video)',
        required: false
    })
    @IsOptional()
    @IsUrl()
    mediaUrl?: string;

    @ApiProperty({ description: 'The date and time when the reply was created' })
    @IsDate()
    createdAt: Date;

    @ApiProperty({ description: 'The date and time when the reply was last updated' })
    @IsDate()
    updatedAt: Date;

    @ApiProperty({ description: 'The number of likes' })
    @IsNumber()
    likeCount: number;

    @ApiProperty({ description: 'The number of dislikes' })
    @IsNumber()
    dislikeCount: number;
}

// Create Reply DTO
export class CreateReplyDTO {
    @ApiProperty({ description: 'The ID of the parent comment' })
    @IsString()
    commentId: string;

    @ApiProperty({ description: 'The World ID of the user creating the reply' })
    @IsString()
    worldId: string;

    @ApiProperty({ description: 'The content of the reply' })
    @IsString()
    content: string;

    @ApiProperty({
        description: 'The type of reply',
        enum: CommentType
    })
    @IsEnum(CommentType)
    commentType: CommentType;

    @ApiProperty({
        description: 'The URL of the media (image or video)',
        required: false
    })
    @IsOptional()
    @IsUrl()
    mediaUrl?: string;
}

// Update Reply DTO
export class UpdateReplyDTO {
    @ApiProperty({ description: 'The content of the reply' })
    @IsString()
    content: string;

    @ApiProperty({
        description: 'The type of reply',
        enum: CommentType
    })
    @IsEnum(CommentType)
    commentType: CommentType;

    @ApiProperty({
        description: 'The URL of the media (image or video)',
        required: false
    })
    @IsOptional()
    @IsUrl()
    mediaUrl?: string;
}

// Reaction DTO
export class ReactionDTO {
    @ApiProperty({ description: 'The ID of the reaction' })
    @IsString()
    _id: string;

    @ApiProperty({ description: 'The ID of the target (comment or reply)' })
    @IsString()
    targetId: string;

    @ApiProperty({
        description: 'The type of target',
        enum: ['Comment', 'Reply']
    })
    @IsString()
    targetType: string;

    @ApiProperty({ description: 'The World ID of the user creating the reaction' })
    @IsString()
    worldId: string;

    @ApiProperty({
        description: 'The type of reaction',
        enum: ReactionType
    })
    @IsEnum(ReactionType)
    reactionType: ReactionType;

    @ApiProperty({ description: 'The date and time when the reaction was created' })
    @IsDate()
    createdAt: Date;
}

// Create Reaction DTO
export class CreateReactionDTO {
    @ApiProperty({ description: 'The ID of the target (comment or reply)' })
    @IsString()
    targetId: string;

    @ApiProperty({
        description: 'The type of target',
        enum: ['Comment', 'Reply']
    })
    @IsString()
    targetType: string;

    @ApiProperty({ description: 'The World ID of the user creating the reaction' })
    @IsString()
    worldId: string;

    @ApiProperty({
        description: 'The type of reaction',
        enum: ReactionType
    })
    @IsEnum(ReactionType)
    reactionType: ReactionType;
}

// Pagination Query DTO
export class PaginationQueryDTO {
    @ApiProperty({
        description: 'Page number (starts from 1)',
        default: 1,
        required: false
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @ApiProperty({
        description: 'Number of items per page',
        default: 10,
        required: false
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    limit?: number = 10;
}
