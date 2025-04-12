import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Logger,
  Get,
  Param,
  Put,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody
} from '@nestjs/swagger';
import {
  CommentDTO,
  CreateCommentDTO,
  UpdateCommentDTO,
  ReplyDTO,
  CreateReplyDTO,
  UpdateReplyDTO,
  ReactionDTO,
  CreateReactionDTO,
  PaginationQueryDTO
} from 'src/Application/DTOs/comments/CommentDTO';
import { CommentService } from 'src/Domain/Services/Comments/comment.service';

@ApiTags('comments')
@ApiBearerAuth()
@Controller('api/v1/comments')
export class CommentController {
  private readonly logger = new Logger(CommentController.name);

  constructor(private readonly commentService: CommentService) {}

  // Comment endpoints
  @Post()
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The comment has been successfully created.',
    type: CommentDTO,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  async createComment(
    @Body() createCommentDto: CreateCommentDTO
  ) {
    this.logger.log('Received request to create comment');

    // Use the worldId from the request as the userId
    const result = await this.commentService.createComment(
      createCommentDto.advertisementId,
      createCommentDto.worldId, // Use worldId instead of hardcoded userId
      createCommentDto.content,
      createCommentDto.commentType,
      createCommentDto.mediaUrl
    );

    return result;
  }

  @Post('with-media')
  @ApiOperation({ summary: 'Create a new comment with media upload' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        advertisementId: {
          type: 'string',
          description: 'The ID of the advertisement',
        },
        worldId: {
          type: 'string',
          description: 'The World ID of the user creating the comment',
        },
        content: {
          type: 'string',
          description: 'The content of the comment',
        },
        commentType: {
          type: 'string',
          enum: ['Text', 'Emoticon', 'Image', 'Video'],
          description: 'The type of comment',
        },
        media: {
          type: 'string',
          format: 'binary',
          description: 'Media file (image or video)',
        },
      },
      required: ['advertisementId', 'worldId', 'content', 'commentType'],
    },
  })
  @UseInterceptors(FileInterceptor('media'))
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The comment with media has been successfully created.',
    type: CommentDTO,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or file type.',
  })
  async createCommentWithMedia(
    @Body() createCommentDto: CreateCommentDTO,
    @UploadedFile() media: Express.Multer.File
  ) {
    this.logger.log('Received request to create comment with media');

    if (!media) {
      throw new BadRequestException('No media file uploaded');
    }

    const result = await this.commentService.createCommentWithMedia(
      createCommentDto.advertisementId,
      createCommentDto.worldId, // Use worldId instead of hardcoded userId
      createCommentDto.content,
      createCommentDto.commentType,
      media
    );

    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get comment by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the comment',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The comment has been found',
    type: CommentDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Comment not found',
  })
  async getCommentById(@Param('id') id: string) {
    this.logger.log(`Received request to get comment with ID: ${id}`);
    const result = await this.commentService.getCommentById(id);
    return result;
  }

  @Get('advertisement/:advertisementId')
  @ApiOperation({ summary: 'Get comments by advertisement ID' })
  @ApiParam({
    name: 'advertisementId',
    required: true,
    description: 'The ID of the advertisement',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The comments have been found',
    type: [CommentDTO],
  })
  async getCommentsByAdvertisementId(
    @Param('advertisementId') advertisementId: string,
    @Query() paginationQuery: PaginationQueryDTO
  ) {
    this.logger.log(`Received request to get comments for advertisement with ID: ${advertisementId}`);

    // Explicitly convert page and limit to numbers to handle Swagger string inputs
    const page = paginationQuery.page ? Number(paginationQuery.page) : 1;
    const limit = paginationQuery.limit ? Number(paginationQuery.limit) : 10;

    this.logger.log(`Using pagination: page=${page}, limit=${limit}`);

    const result = await this.commentService.getCommentsByAdvertisementId(
      advertisementId,
      page,
      limit
    );

    // Log the result details
    this.logger.log(`Controller received result: ${result.comments.length} comments, total: ${result.total}`);

    // Ensure the total is a number
    if (typeof result.total !== 'number') {
      this.logger.warn(`Total is not a number: ${result.total}, converting to number`);
      result.total = Number(result.total) || result.comments.length;
    }

    return result;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a comment' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the comment to update',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The comment has been successfully updated.',
    type: CommentDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Comment not found.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  async updateComment(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDTO
  ) {
    this.logger.log(`Received request to update comment with ID: ${id}`);

    // TODO: In a real application, you would check if the user is the owner of the comment

    const result = await this.commentService.updateComment(
      id,
      updateCommentDto.content,
      updateCommentDto.commentType,
      updateCommentDto.mediaUrl
    );

    return result;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the comment to delete',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The comment has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Comment not found.',
  })
  async deleteComment(
    @Param('id') id: string
  ) {
    this.logger.log(`Received request to delete comment with ID: ${id}`);

    // TODO: In a real application, you would check if the user is the owner of the comment

    await this.commentService.deleteComment(id);

    return { statusCode: HttpStatus.NO_CONTENT };
  }

  // Reply endpoints
  @Post('reply')
  @ApiOperation({ summary: 'Create a new reply' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The reply has been successfully created.',
    type: ReplyDTO,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  async createReply(
    @Body() createReplyDto: CreateReplyDTO
  ) {
    this.logger.log('Received request to create reply');

    const result = await this.commentService.createReply(
      createReplyDto.commentId,
      createReplyDto.worldId, // Use worldId instead of hardcoded userId
      createReplyDto.content,
      createReplyDto.commentType,
      createReplyDto.mediaUrl
    );

    return result;
  }

  @Post('reply/with-media')
  @ApiOperation({ summary: 'Create a new reply with media upload' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        commentId: {
          type: 'string',
          description: 'The ID of the parent comment',
        },
        worldId: {
          type: 'string',
          description: 'The World ID of the user creating the reply',
        },
        content: {
          type: 'string',
          description: 'The content of the reply',
        },
        commentType: {
          type: 'string',
          enum: ['Text', 'Emoticon', 'Image', 'Video'],
          description: 'The type of reply',
        },
        media: {
          type: 'string',
          format: 'binary',
          description: 'Media file (image or video)',
        },
      },
      required: ['commentId', 'worldId', 'content', 'commentType'],
    },
  })
  @UseInterceptors(FileInterceptor('media'))
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The reply with media has been successfully created.',
    type: ReplyDTO,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or file type.',
  })
  async createReplyWithMedia(
    @Body() createReplyDto: CreateReplyDTO,
    @UploadedFile() media: Express.Multer.File
  ) {
    this.logger.log('Received request to create reply with media');

    if (!media) {
      throw new BadRequestException('No media file uploaded');
    }

    const result = await this.commentService.createReplyWithMedia(
      createReplyDto.commentId,
      createReplyDto.worldId,
      createReplyDto.content,
      createReplyDto.commentType,
      media
    );

    return result;
  }

  @Get('reply/:id')
  @ApiOperation({ summary: 'Get reply by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the reply',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The reply has been found',
    type: ReplyDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Reply not found',
  })
  async getReplyById(@Param('id') id: string) {
    this.logger.log(`Received request to get reply with ID: ${id}`);
    const result = await this.commentService.getReplyById(id);
    return result;
  }

  @Get('reply/comment/:commentId')
  @ApiOperation({ summary: 'Get replies by comment ID' })
  @ApiParam({
    name: 'commentId',
    required: true,
    description: 'The ID of the comment',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The replies have been found',
    type: [ReplyDTO],
  })
  async getRepliesByCommentId(
    @Param('commentId') commentId: string,
    @Query() paginationQuery: PaginationQueryDTO
  ) {
    this.logger.log(`Received request to get replies for comment with ID: ${commentId}`);

    // Explicitly convert page and limit to numbers to handle Swagger string inputs
    const page = paginationQuery.page ? Number(paginationQuery.page) : 1;
    const limit = paginationQuery.limit ? Number(paginationQuery.limit) : 10;

    this.logger.log(`Using pagination: page=${page}, limit=${limit}`);

    const result = await this.commentService.getRepliesByCommentId(
      commentId,
      page,
      limit
    );

    return result;
  }

  @Put('reply/:id')
  @ApiOperation({ summary: 'Update a reply' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the reply to update',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The reply has been successfully updated.',
    type: ReplyDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Reply not found.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  async updateReply(
    @Param('id') id: string,
    @Body() updateReplyDto: UpdateReplyDTO
  ) {
    this.logger.log(`Received request to update reply with ID: ${id}`);

    // TODO: In a real application, you would check if the user is the owner of the reply

    const result = await this.commentService.updateReply(
      id,
      updateReplyDto.content,
      updateReplyDto.commentType,
      updateReplyDto.mediaUrl
    );

    return result;
  }

  @Delete('reply/:id')
  @ApiOperation({ summary: 'Delete a reply' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the reply to delete',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The reply has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Reply not found.',
  })
  async deleteReply(
    @Param('id') id: string
  ) {
    this.logger.log(`Received request to delete reply with ID: ${id}`);

    // TODO: In a real application, you would check if the user is the owner of the reply

    await this.commentService.deleteReply(id);

    return { statusCode: HttpStatus.NO_CONTENT };
  }

  // Reaction endpoints
  @Post('reaction')
  @ApiOperation({ summary: 'Add a reaction (like/dislike)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The reaction has been successfully added.',
    type: ReactionDTO,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  async addReaction(
    @Body() createReactionDto: CreateReactionDTO
  ) {
    this.logger.log('Received request to add reaction');

    const result = await this.commentService.addReaction(
      createReactionDto.targetId,
      createReactionDto.targetType,
      createReactionDto.worldId,
      createReactionDto.reactionType
    );

    return result;
  }

  @Delete('reaction/:id')
  @ApiOperation({ summary: 'Remove a reaction' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the reaction to remove',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The reaction has been successfully removed.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Reaction not found.',
  })
  async removeReaction(
    @Param('id') id: string
  ) {
    this.logger.log(`Received request to remove reaction with ID: ${id}`);

    await this.commentService.removeReaction(id);

    return { statusCode: HttpStatus.NO_CONTENT };
  }

  @Get('reaction/user')
  @ApiOperation({ summary: 'Get user reaction for a target' })
  @ApiQuery({
    name: 'targetId',
    required: true,
    description: 'The ID of the target (comment or reply)',
  })
  @ApiQuery({
    name: 'targetType',
    required: true,
    description: 'The type of target (Comment or Reply)',
    enum: ['Comment', 'Reply'],
  })
  @ApiQuery({
    name: 'worldId',
    required: true,
    description: 'The World ID of the user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user reaction has been found',
    type: ReactionDTO,
  })
  async getUserReaction(
    @Query('targetId') targetId: string,
    @Query('targetType') targetType: string,
    @Query('worldId') worldId: string
  ) {
    this.logger.log(`Received request to get user reaction for ${targetType} with ID: ${targetId} by user with World ID: ${worldId}`);

    const result = await this.commentService.getUserReaction(
      targetId,
      targetType,
      worldId
    );

    return result;
  }
}
