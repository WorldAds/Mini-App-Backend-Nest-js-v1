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

    // If the comment has a mediaUrl, ensure it has the correct format with /uploads/ prefix
    if (comment.mediaUrl && !comment.mediaUrl.startsWith('/uploads/')) {
      comment.mediaUrl = this.fileUploadService.getFileUrl(comment.mediaUrl);
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
    this.logger.log(`Total comments for advertisement ${advertisementId}: ${total}`);

    // Ensure all comments have the correct mediaUrl format
    comments.forEach(comment => {
      if (comment.mediaUrl && !comment.mediaUrl.startsWith('/uploads/')) {
        comment.mediaUrl = this.fileUploadService.getFileUrl(comment.mediaUrl);
      }
    });

    // Log the final result
    this.logger.log(`Returning ${comments.length} comments with total count: ${total}`);

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

    // Create the reply
    this.logger.log(`Calling commentRepository.createReply for comment: ${commentId}`);
    const created = await this.commentRepository.createReply(reply);
    this.logger.log(`Reply created successfully with ID: ${created._id}`);

    // Verify the comment's reply count was updated
    this.logger.log(`Verifying reply count update for comment: ${commentId}`);
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

    // Create the reply
    this.logger.log(`Calling commentRepository.createReply for comment: ${commentId} with media`);
    const created = await this.commentRepository.createReply(reply);
    this.logger.log(`Reply with media created successfully with ID: ${created._id}`);

    // Verify the comment's reply count was updated
    this.logger.log(`Verifying reply count update for comment: ${commentId}`);
    const updatedComment = await this.getCommentById(commentId);
    this.logger.log(`After reply creation with media, comment replyCount: ${updatedComment.replyCount}`);

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

    // If the reply has a mediaUrl, ensure it has the correct format with /uploads/ prefix
    if (reply.mediaUrl && !reply.mediaUrl.startsWith('/uploads/')) {
      reply.mediaUrl = this.fileUploadService.getFileUrl(reply.mediaUrl);
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

    // Ensure all replies have the correct mediaUrl format
    replies.forEach(reply => {
      if (reply.mediaUrl && !reply.mediaUrl.startsWith('/uploads/')) {
        reply.mediaUrl = this.fileUploadService.getFileUrl(reply.mediaUrl);
      }
    });

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

    // Check if target exists and get the current target object
    let target: Comment | Reply;
    if (targetType === 'Comment') {
      target = await this.getCommentById(targetId);
    } else if (targetType === 'Reply') {
      target = await this.getReplyById(targetId);
    } else {
      throw new BadRequestException('Invalid target type');
    }

    // Check if user already reacted to this target
    const existingReaction = await this.commentRepository.findReactionByUserAndTarget(
      worldId,
      targetId,
      targetType
    );

    if (existingReaction) {
      // If the user is changing their reaction type (e.g., from like to dislike)
      if (existingReaction.reactionType !== reactionType) {
        // Decrement the old reaction count
        if (existingReaction.reactionType === ReactionType.Like) {
          if (targetType === 'Comment') {
            await this.commentRepository.updateComment(targetId, { likeCount: Math.max(0, target.likeCount - 1) });
          } else {
            await this.commentRepository.updateReply(targetId, { likeCount: Math.max(0, target.likeCount - 1) });
          }
        } else if (existingReaction.reactionType === ReactionType.Dislike) {
          if (targetType === 'Comment') {
            await this.commentRepository.updateComment(targetId, { dislikeCount: Math.max(0, target.dislikeCount - 1) });
          } else {
            await this.commentRepository.updateReply(targetId, { dislikeCount: Math.max(0, target.dislikeCount - 1) });
          }
        }

        // Update the existing reaction
        await this.commentRepository.updateReaction(existingReaction._id.toString(), { reactionType });

        // Increment the new reaction count
        if (reactionType === ReactionType.Like) {
          if (targetType === 'Comment') {
            await this.commentRepository.updateComment(targetId, { likeCount: target.likeCount + 1 });
          } else {
            await this.commentRepository.updateReply(targetId, { likeCount: target.likeCount + 1 });
          }
        } else if (reactionType === ReactionType.Dislike) {
          if (targetType === 'Comment') {
            await this.commentRepository.updateComment(targetId, { dislikeCount: target.dislikeCount + 1 });
          } else {
            await this.commentRepository.updateReply(targetId, { dislikeCount: target.dislikeCount + 1 });
          }
        }

        // Get the updated reaction
        const updatedReaction = await this.commentRepository.findReactionById(existingReaction._id.toString());
        if (!updatedReaction) {
          throw new NotFoundException(`Reaction with ID ${existingReaction._id.toString()} not found after update`);
        }
        this.logger.log(`Reaction updated successfully with ID: ${updatedReaction._id}`);
        return updatedReaction;
      }

      // If the user is trying to add the same reaction type, return the existing one
      this.logger.log(`User already reacted with ${reactionType} to this ${targetType}`);
      return existingReaction;
    }

    // Create a new reaction
    const reaction = new Reaction(
      targetId,
      targetType,
      worldId,
      reactionType
    );

    const created = await this.commentRepository.createReaction(reaction);
    this.logger.log(`Reaction created successfully with ID: ${created._id}`);

    // Increment the appropriate count on the target
    if (reactionType === ReactionType.Like) {
      if (targetType === 'Comment') {
        await this.commentRepository.updateComment(targetId, { likeCount: target.likeCount + 1 });
        this.logger.log(`Incremented like count for comment ${targetId} to ${target.likeCount + 1}`);
      } else {
        await this.commentRepository.updateReply(targetId, { likeCount: target.likeCount + 1 });
        this.logger.log(`Incremented like count for reply ${targetId} to ${target.likeCount + 1}`);
      }
    } else if (reactionType === ReactionType.Dislike) {
      if (targetType === 'Comment') {
        await this.commentRepository.updateComment(targetId, { dislikeCount: target.dislikeCount + 1 });
        this.logger.log(`Incremented dislike count for comment ${targetId} to ${target.dislikeCount + 1}`);
      } else {
        await this.commentRepository.updateReply(targetId, { dislikeCount: target.dislikeCount + 1 });
        this.logger.log(`Incremented dislike count for reply ${targetId} to ${target.dislikeCount + 1}`);
      }
    }

    return created;
  }

  async removeReaction(id: string): Promise<void> {
    this.logger.log(`Removing reaction with ID: ${id}`);

    // Get the reaction before deleting it
    const reaction = await this.commentRepository.findReactionById(id);
    if (!reaction) {
      throw new NotFoundException(`Reaction with ID ${id} not found`);
    }

    // Get the target (comment or reply)
    let target: Comment | Reply;
    if (reaction.targetType === 'Comment') {
      target = await this.getCommentById(reaction.targetId);
    } else if (reaction.targetType === 'Reply') {
      target = await this.getReplyById(reaction.targetId);
    } else {
      throw new BadRequestException('Invalid target type');
    }

    // Decrement the appropriate count on the target
    if (reaction.reactionType === ReactionType.Like) {
      if (reaction.targetType === 'Comment') {
        await this.commentRepository.updateComment(reaction.targetId, { likeCount: Math.max(0, target.likeCount - 1) });
        this.logger.log(`Decremented like count for comment ${reaction.targetId} to ${Math.max(0, target.likeCount - 1)}`);
      } else {
        await this.commentRepository.updateReply(reaction.targetId, { likeCount: Math.max(0, target.likeCount - 1) });
        this.logger.log(`Decremented like count for reply ${reaction.targetId} to ${Math.max(0, target.likeCount - 1)}`);
      }
    } else if (reaction.reactionType === ReactionType.Dislike) {
      if (reaction.targetType === 'Comment') {
        await this.commentRepository.updateComment(reaction.targetId, { dislikeCount: Math.max(0, target.dislikeCount - 1) });
        this.logger.log(`Decremented dislike count for comment ${reaction.targetId} to ${Math.max(0, target.dislikeCount - 1)}`);
      } else {
        await this.commentRepository.updateReply(reaction.targetId, { dislikeCount: Math.max(0, target.dislikeCount - 1) });
        this.logger.log(`Decremented dislike count for reply ${reaction.targetId} to ${Math.max(0, target.dislikeCount - 1)}`);
      }
    }

    // Delete the reaction
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
