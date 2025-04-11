import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject, Logger } from '@nestjs/common';
import { ICommentService } from './comment.service.interface';
import { ICommentRepository } from '../../Infrastructure/Comments/ICommentRepository';
import { Comment } from '../../Entities/Comment';
import { Reply } from '../../Entities/Reply';
import { Reaction } from '../../Entities/Reaction';
import { CommentType } from '../../ValueObjects/CommentType';
import { ReactionType } from '../../ValueObjects/ReactionType';
import { FileUploadService } from 'src/infrastructure/file-upload/file-upload.service';

@Injectable()
export class CommentService implements ICommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(
    @Inject('ICommentRepository')
    private readonly commentRepository: ICommentRepository,
    private readonly fileUploadService: FileUploadService,
  ) {}

  // Comment methods
  async createComment(
    advertisementId: string,
    worldId: string,
    content: string,
    commentType: CommentType,
    mediaUrl?: string
  ): Promise<Comment> {
    this.logger.log(`Creating new comment for advertisement: ${advertisementId} by user with World ID: ${worldId}`);

    const comment = new Comment(
      advertisementId,
      worldId,
      content,
      commentType,
      mediaUrl
    );

    const created = await this.commentRepository.createComment(comment);
    this.logger.log(`Comment created successfully with ID: ${created._id}`);

    return created;
  }

  async createCommentWithMedia(
    advertisementId: string,
    worldId: string,
    content: string,
    commentType: CommentType,
    mediaFile: Express.Multer.File
  ): Promise<Comment> {
    this.logger.log(`Creating new comment with media for advertisement: ${advertisementId} by user with World ID: ${worldId}`);

    // Validate media type based on commentType
    if (commentType === CommentType.Image) {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!validImageTypes.includes(mediaFile.mimetype)) {
        throw new BadRequestException('Invalid file type for image. Only JPG, PNG, and GIF are allowed.');
      }
    } else if (commentType === CommentType.Video) {
      const validVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];
      if (!validVideoTypes.includes(mediaFile.mimetype)) {
        throw new BadRequestException('Invalid file type for video. Only MP4, MPEG, MOV, and AVI are allowed.');
      }
    } else {
      throw new BadRequestException('Comment type must be Image or Video when uploading media.');
    }

    // Save the media file
    const relativePath = await this.fileUploadService.saveCommentMedia(mediaFile);

    // Get the public URL
    const mediaUrl = this.fileUploadService.getFileUrl(relativePath);

    // Create the comment with the media URL
    const comment = new Comment(
      advertisementId,
      worldId,
      content,
      commentType,
      relativePath // Store the relative path in the database
    );

    const created = await this.commentRepository.createComment(comment);
    this.logger.log(`Comment with media created successfully with ID: ${created._id}`);

    // Return the comment with the public URL for the media
    created.mediaUrl = mediaUrl;
    return created;
  }

  async getCommentById(id: string): Promise<Comment> {
    this.logger.log(`Retrieving comment with ID: ${id}`);
    const comment = await this.commentRepository.findCommentById(id);

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  async getCommentsByAdvertisementId(
    advertisementId: string,
    page = 1,
    limit = 10
  ): Promise<{ comments: Comment[], total: number, page: number, limit: number }> {
    this.logger.log(`Retrieving comments for advertisement: ${advertisementId}, page: ${page}, limit: ${limit}`);

    const skip = (page - 1) * limit;
    const comments = await this.commentRepository.findCommentsByAdvertisementId(
      advertisementId,
      skip,
      limit
    );

    const total = await this.commentRepository.countCommentsByAdvertisementId(advertisementId);

    return {
      comments,
      total,
      page,
      limit
    };
  }

  async updateComment(
    id: string,
    content: string,
    commentType: CommentType,
    mediaUrl?: string
  ): Promise<Comment> {
    this.logger.log(`Updating comment with ID: ${id}`);

    // Check if comment exists
    const comment = await this.getCommentById(id);

    const updated = await this.commentRepository.updateComment(id, {
      content,
      commentType,
      mediaUrl,
      updatedAt: new Date()
    });

    this.logger.log(`Comment updated successfully: ${id}`);
    return updated;
  }

  async deleteComment(id: string): Promise<void> {
    this.logger.log(`Deleting comment with ID: ${id}`);

    // Check if comment exists
    await this.getCommentById(id);

    await this.commentRepository.deleteComment(id);
    this.logger.log(`Comment deleted successfully: ${id}`);
  }

  // Reply methods
  async createReply(
    commentId: string,
    worldId: string,
    content: string,
    commentType: CommentType,
    mediaUrl?: string
  ): Promise<Reply> {
    this.logger.log(`Creating new reply for comment: ${commentId} by user with World ID: ${worldId}`);

    // Check if comment exists
    const comment = await this.getCommentById(commentId);
    this.logger.log(`Found parent comment with ID: ${comment._id}, current replyCount: ${comment.replyCount}`);

    const reply = new Reply(
      commentId,
      worldId,
      content,
      commentType,
      mediaUrl
    );

    const created = await this.commentRepository.createReply(reply);
    this.logger.log(`Reply created successfully with ID: ${created._id}`);

    // Verify the comment's reply count was updated
    const updatedComment = await this.getCommentById(commentId);
    this.logger.log(`After reply creation, comment replyCount: ${updatedComment.replyCount}`);

    return created;
  }

  async createReplyWithMedia(
    commentId: string,
    worldId: string,
    content: string,
    commentType: CommentType,
    mediaFile: Express.Multer.File
  ): Promise<Reply> {
    this.logger.log(`Creating new reply with media for comment: ${commentId} by user with World ID: ${worldId}`);

    // Check if comment exists
    const comment = await this.getCommentById(commentId);
    this.logger.log(`Found parent comment with ID: ${comment._id}, current replyCount: ${comment.replyCount}`);

    // Validate media type based on commentType
    if (commentType === CommentType.Image) {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!validImageTypes.includes(mediaFile.mimetype)) {
        throw new BadRequestException('Invalid file type for image. Only JPG, PNG, and GIF are allowed.');
      }
    } else if (commentType === CommentType.Video) {
      const validVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];
      if (!validVideoTypes.includes(mediaFile.mimetype)) {
        throw new BadRequestException('Invalid file type for video. Only MP4, MPEG, MOV, and AVI are allowed.');
      }
    } else {
      throw new BadRequestException('Comment type must be Image or Video when uploading media.');
    }

    // Save the media file
    const relativePath = await this.fileUploadService.saveCommentMedia(mediaFile);

    // Get the public URL
    const mediaUrl = this.fileUploadService.getFileUrl(relativePath);

    // Create the reply with the media URL
    const reply = new Reply(
      commentId,
      worldId,
      content,
      commentType,
      relativePath // Store the relative path in the database
    );

    const created = await this.commentRepository.createReply(reply);
    this.logger.log(`Reply with media created successfully with ID: ${created._id}`);

    // Verify the comment's reply count was updated
    const updatedComment = await this.getCommentById(commentId);
    this.logger.log(`After reply creation, comment replyCount: ${updatedComment.replyCount}`);

    // Return the reply with the public URL for the media
    created.mediaUrl = mediaUrl;
    return created;
  }

  async getReplyById(id: string): Promise<Reply> {
    this.logger.log(`Retrieving reply with ID: ${id}`);
    const reply = await this.commentRepository.findReplyById(id);

    if (!reply) {
      throw new NotFoundException(`Reply with ID ${id} not found`);
    }

    return reply;
  }

  async getRepliesByCommentId(
    commentId: string,
    page = 1,
    limit = 10
  ): Promise<{ replies: Reply[], total: number, page: number, limit: number }> {
    this.logger.log(`Retrieving replies for comment: ${commentId}, page: ${page}, limit: ${limit}`);

    // Check if comment exists
    await this.getCommentById(commentId);

    const skip = (page - 1) * limit;
    const replies = await this.commentRepository.findRepliesByCommentId(
      commentId,
      skip,
      limit
    );

    const total = await this.commentRepository.countRepliesByCommentId(commentId);

    return {
      replies,
      total,
      page,
      limit
    };
  }

  async updateReply(
    id: string,
    content: string,
    commentType: CommentType,
    mediaUrl?: string
  ): Promise<Reply> {
    this.logger.log(`Updating reply with ID: ${id}`);

    // Check if reply exists
    const reply = await this.getReplyById(id);

    const updated = await this.commentRepository.updateReply(id, {
      content,
      commentType,
      mediaUrl,
      updatedAt: new Date()
    });

    this.logger.log(`Reply updated successfully: ${id}`);
    return updated;
  }

  async deleteReply(id: string): Promise<void> {
    this.logger.log(`Deleting reply with ID: ${id}`);

    // Check if reply exists
    await this.getReplyById(id);

    await this.commentRepository.deleteReply(id);
    this.logger.log(`Reply deleted successfully: ${id}`);
  }

  // Reaction methods
  async addReaction(
    targetId: string,
    targetType: string,
    worldId: string,
    reactionType: ReactionType
  ): Promise<Reaction> {
    this.logger.log(`Adding ${reactionType} reaction to ${targetType} with ID: ${targetId} by user with World ID: ${worldId}`);

    // Validate target type
    if (targetType !== 'Comment' && targetType !== 'Reply') {
      throw new BadRequestException('Invalid target type. Must be either "Comment" or "Reply"');
    }

    // Check if target exists
    if (targetType === 'Comment') {
      await this.getCommentById(targetId);
    } else if (targetType === 'Reply') {
      await this.getReplyById(targetId);
    }

    const reaction = new Reaction(
      targetId,
      targetType,
      worldId,
      reactionType
    );

    const created = await this.commentRepository.createReaction(reaction);
    this.logger.log(`Reaction created successfully with ID: ${created._id}`);

    return created;
  }

  async removeReaction(id: string): Promise<void> {
    this.logger.log(`Removing reaction with ID: ${id}`);

    await this.commentRepository.deleteReaction(id);
    this.logger.log(`Reaction removed successfully: ${id}`);
  }

  async getUserReaction(
    targetId: string,
    targetType: string,
    worldId: string
  ): Promise<Reaction | null> {
    this.logger.log(`Getting reaction for ${targetType} with ID: ${targetId} by user with World ID: ${worldId}`);

    // Validate target type
    if (targetType !== 'Comment' && targetType !== 'Reply') {
      throw new BadRequestException('Invalid target type. Must be either "Comment" or "Reply"');
    }

    return await this.commentRepository.findReactionByUserAndTarget(
      worldId,
      targetId,
      targetType
    );
  }
}
