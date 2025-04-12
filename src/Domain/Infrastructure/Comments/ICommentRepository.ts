import { Comment } from '../../Entities/Comment';
import { Reply } from '../../Entities/Reply';
import { Reaction } from '../../Entities/Reaction';
import { ReactionType } from '../../ValueObjects/ReactionType';

export interface ICommentRepository {
  // Comment methods
  createComment(comment: Comment): Promise<Comment>;
  findCommentById(id: string): Promise<Comment | null>;
  findCommentsByAdvertisementId(advertisementId: string, skip?: number, take?: number): Promise<Comment[]>;
  updateComment(id: string, comment: Partial<Comment>): Promise<Comment>;
  deleteComment(id: string): Promise<void>;
  countCommentsByAdvertisementId(advertisementId: string): Promise<number>;

  // Reply methods
  createReply(reply: Reply): Promise<Reply>;
  findReplyById(id: string): Promise<Reply | null>;
  findRepliesByCommentId(commentId: string, skip?: number, take?: number): Promise<Reply[]>;
  updateReply(id: string, reply: Partial<Reply>): Promise<Reply>;
  deleteReply(id: string): Promise<void>;
  countRepliesByCommentId(commentId: string): Promise<number>;

  // Reaction methods
  createReaction(reaction: Reaction): Promise<Reaction>;
  findReactionById(id: string): Promise<Reaction | null>;
  findReactionByUserAndTarget(worldId: string, targetId: string, targetType: string): Promise<Reaction | null>;
  updateReaction(id: string, updateData: Partial<Reaction>): Promise<Reaction>;
  deleteReaction(id: string): Promise<void>;
  countReactionsByTargetAndType(targetId: string, targetType: string, reactionType: ReactionType): Promise<number>;

  // Update reaction counts
  updateCommentReactionCount(commentId: string): Promise<void>;
  updateReplyReactionCount(replyId: string): Promise<void>;
  updateCommentReplyCount(commentId: string): Promise<void>;
}
