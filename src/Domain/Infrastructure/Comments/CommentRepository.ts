import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';

import { ICommentRepository } from './ICommentRepository';
import { Comment } from '../../Entities/Comment';
import { Reply } from '../../Entities/Reply';
import { Reaction } from '../../Entities/Reaction';
import { ReactionType } from '../../ValueObjects/ReactionType';

@Injectable()
export class CommentRepository implements ICommentRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @InjectRepository(Reply)
    private readonly replyRepository: Repository<Reply>,

    @InjectRepository(Reaction)
    private readonly reactionRepository: Repository<Reaction>,
  ) {}

  // Comment methods
  async createComment(comment: Comment): Promise<Comment> {
    return await this.commentRepository.save(comment);
  }

  async findCommentById(id: string): Promise<Comment | null> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid comment ID format');
      }
      return await this.commentRepository.findOne({
        where: { _id: new ObjectId(id) },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Invalid comment ID');
    }
  }

  async findCommentsByAdvertisementId(advertisementId: string, skip = 0, take = 10): Promise<Comment[]> {
    console.log(`Finding comments for advertisement: ${advertisementId}, skip: ${skip}, take: ${take}`);

    try {
      // Get all comments for this advertisement
      const allComments = await this.commentRepository.find({
        where: { advertisementId },
        order: { createdAt: 'DESC' }
      });

      console.log(`Found ${allComments.length} total comments for advertisement: ${advertisementId}`);

      // Apply pagination manually
      const paginatedComments = allComments.slice(skip, skip + take);
      console.log(`Returning ${paginatedComments.length} comments after pagination`);

      return paginatedComments;
    } catch (error) {
      console.error(`Error finding comments: ${error.message}`);
      return [];
    }
  }

  async updateComment(id: string, commentData: Partial<Comment>): Promise<Comment> {
    await this.commentRepository.update(
      { _id: new ObjectId(id) },
      { ...commentData, updatedAt: new Date() }
    );

    const updated = await this.findCommentById(id);
    if (!updated) {
      throw new NotFoundException(`Comment with id ${id} not found after update`);
    }
    return updated;
  }

  async deleteComment(id: string): Promise<void> {
    const result = await this.commentRepository.delete({ _id: new ObjectId(id) });
    if (result.affected === 0) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    // Delete all replies to this comment
    await this.replyRepository.delete({ commentId: id });

    // Delete all reactions to this comment
    await this.reactionRepository.delete({ targetId: id, targetType: 'Comment' });
  }

  async countCommentsByAdvertisementId(advertisementId: string): Promise<number> {
    console.log(`Counting comments for advertisement: ${advertisementId}`);

    try {
      // First, get all comments for this advertisement (without pagination)
      const comments = await this.commentRepository.find({
        where: { advertisementId }
      });

      const count = comments.length;
      console.log(`Found ${count} comments for advertisement: ${advertisementId}`);
      return count;
    } catch (error) {
      console.error(`Error counting comments: ${error.message}`);
      return 0;
    }
  }

  // Reply methods
  async createReply(reply: Reply): Promise<Reply> {
    console.log(`Creating reply for comment: ${reply.commentId}`);
    const newReply = await this.replyRepository.save(reply);
    console.log(`Reply created with ID: ${newReply._id}`);

    // Update comment reply count
    await this.updateCommentReplyCount(reply.commentId);

    return newReply;
  }

  async findReplyById(id: string): Promise<Reply | null> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid reply ID format');
      }
      return await this.replyRepository.findOne({
        where: { _id: new ObjectId(id) },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Invalid reply ID');
    }
  }

  async findRepliesByCommentId(commentId: string, skip = 0, take = 10): Promise<Reply[]> {
    console.log(`Finding replies for comment: ${commentId}, skip: ${skip}, take: ${take}`);

    try {
      // Get all replies for this comment
      const allReplies = await this.replyRepository.find({
        where: { commentId },
        order: { createdAt: 'ASC' }
      });

      console.log(`Found ${allReplies.length} total replies for comment: ${commentId}`);

      // Apply pagination manually
      const paginatedReplies = allReplies.slice(skip, skip + take);
      console.log(`Returning ${paginatedReplies.length} replies after pagination`);

      return paginatedReplies;
    } catch (error) {
      console.error(`Error finding replies: ${error.message}`);
      return [];
    }
  }

  async updateReply(id: string, replyData: Partial<Reply>): Promise<Reply> {
    await this.replyRepository.update(
      { _id: new ObjectId(id) },
      { ...replyData, updatedAt: new Date() }
    );

    const updated = await this.findReplyById(id);
    if (!updated) {
      throw new NotFoundException(`Reply with id ${id} not found after update`);
    }
    return updated;
  }

  async deleteReply(id: string): Promise<void> {
    const reply = await this.findReplyById(id);
    if (!reply) {
      throw new NotFoundException(`Reply with ID ${id} not found`);
    }

    const commentId = reply.commentId;

    const result = await this.replyRepository.delete({ _id: new ObjectId(id) });
    if (result.affected === 0) {
      throw new NotFoundException(`Reply with ID ${id} not found`);
    }

    // Delete all reactions to this reply
    await this.reactionRepository.delete({ targetId: id, targetType: 'Reply' });

    // Update comment reply count
    await this.updateCommentReplyCount(commentId);
  }

  async countRepliesByCommentId(commentId: string): Promise<number> {
    console.log(`Counting replies for comment: ${commentId}`);

    try {
      // Get all replies for this comment
      const replies = await this.replyRepository.find({
        where: { commentId }
      });

      const count = replies.length;
      console.log(`Found ${count} replies for comment: ${commentId}`);
      return count;
    } catch (error) {
      console.error(`Error counting replies: ${error.message}`);
      return 0;
    }
  }

  // Reaction methods
  async createReaction(reaction: Reaction): Promise<Reaction> {
    // Check if user already reacted to this target
    const existingReaction = await this.findReactionByUserAndTarget(
      reaction.worldId,
      reaction.targetId,
      reaction.targetType
    );

    // If reaction exists and is the same type, do nothing
    if (existingReaction && existingReaction.reactionType === reaction.reactionType) {
      return existingReaction;
    }

    // If reaction exists but is different type, delete it first
    if (existingReaction) {
      await this.reactionRepository.delete({ _id: existingReaction._id });
    }

    // Create new reaction
    const newReaction = await this.reactionRepository.save(reaction);

    // Update reaction counts
    if (reaction.targetType === 'Comment') {
      await this.updateCommentReactionCount(reaction.targetId);
    } else if (reaction.targetType === 'Reply') {
      await this.updateReplyReactionCount(reaction.targetId);
    }

    return newReaction;
  }

  async findReactionById(id: string): Promise<Reaction | null> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid reaction ID format');
      }
      return await this.reactionRepository.findOne({
        where: { _id: new ObjectId(id) },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Invalid reaction ID');
    }
  }

  async findReactionByUserAndTarget(worldId: string, targetId: string, targetType: string): Promise<Reaction | null> {
    return await this.reactionRepository.findOne({
      where: { worldId, targetId, targetType },
    });
  }

  async deleteReaction(id: string): Promise<void> {
    const reaction = await this.findReactionById(id);
    if (!reaction) {
      throw new NotFoundException(`Reaction with ID ${id} not found`);
    }

    const { targetId, targetType } = reaction;

    const result = await this.reactionRepository.delete({ _id: new ObjectId(id) });
    if (result.affected === 0) {
      throw new NotFoundException(`Reaction with ID ${id} not found`);
    }

    // Update reaction counts
    if (targetType === 'Comment') {
      await this.updateCommentReactionCount(targetId);
    } else if (targetType === 'Reply') {
      await this.updateReplyReactionCount(targetId);
    }
  }

  async countReactionsByTargetAndType(targetId: string, targetType: string, reactionType: ReactionType): Promise<number> {
    return await this.reactionRepository.count({
      where: { targetId, targetType, reactionType },
    });
  }

  // Update reaction counts
  async updateCommentReactionCount(commentId: string): Promise<void> {
    const likeCount = await this.countReactionsByTargetAndType(
      commentId,
      'Comment',
      ReactionType.Like
    );

    const dislikeCount = await this.countReactionsByTargetAndType(
      commentId,
      'Comment',
      ReactionType.Dislike
    );

    await this.commentRepository.update(
      { _id: new ObjectId(commentId) },
      { likeCount, dislikeCount }
    );
  }

  async updateReplyReactionCount(replyId: string): Promise<void> {
    const likeCount = await this.countReactionsByTargetAndType(
      replyId,
      'Reply',
      ReactionType.Like
    );

    const dislikeCount = await this.countReactionsByTargetAndType(
      replyId,
      'Reply',
      ReactionType.Dislike
    );

    await this.replyRepository.update(
      { _id: new ObjectId(replyId) },
      { likeCount, dislikeCount }
    );
  }

  async updateCommentReplyCount(commentId: string): Promise<void> {
    console.log(`Updating reply count for comment: ${commentId}`);
    const replyCount = await this.countRepliesByCommentId(commentId);
    console.log(`Found ${replyCount} replies for comment: ${commentId}`);

    try {
      // Check if the comment exists
      const comment = await this.commentRepository.findOne({
        where: { _id: new ObjectId(commentId) }
      });

      if (!comment) {
        console.error(`Comment with ID ${commentId} not found when updating reply count`);
        return;
      }

      // Use a more direct approach to update the replyCount
      comment.replyCount = replyCount;
      comment.updatedAt = new Date();

      await this.commentRepository.save(comment);

      console.log(`Comment updated directly: replyCount = ${comment.replyCount}`);

      // Verify the update
      const updatedComment = await this.commentRepository.findOne({
        where: { _id: new ObjectId(commentId) }
      });

      console.log(`Comment after update: replyCount = ${updatedComment?.replyCount}`);
    } catch (error) {
      console.error(`Error updating reply count: ${error.message}`);
      throw error;
    }
  }
}
