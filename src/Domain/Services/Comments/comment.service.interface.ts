import { Comment } from '../../Entities/Comment';
import { Reply } from '../../Entities/Reply';
import { Reaction } from '../../Entities/Reaction';
import { CommentType } from '../../ValueObjects/CommentType';
import { ReactionType } from '../../ValueObjects/ReactionType';

export interface ICommentService {
  // Comment methods
  createComment(
    advertisementId: string,
    worldId: string,
    content: string,
    commentType: CommentType,
    mediaUrl?: string
  ): Promise<Comment>;

  createCommentWithMedia(
    advertisementId: string,
    worldId: string,
    content: string,
    commentType: CommentType,
    mediaFile: Express.Multer.File
  ): Promise<Comment>;

  getCommentById(id: string): Promise<Comment>;

  getCommentsByAdvertisementId(
    advertisementId: string,
    page?: number,
    limit?: number
  ): Promise<{ comments: Comment[], total: number, page: number, limit: number }>;

  updateComment(
    id: string,
    content: string,
    commentType: CommentType,
    mediaUrl?: string
  ): Promise<Comment>;

  deleteComment(id: string): Promise<void>;

  // Reply methods
  createReply(
    commentId: string,
    worldId: string,
    content: string,
    commentType: CommentType,
    mediaUrl?: string
  ): Promise<Reply>;

  createReplyWithMedia(
    commentId: string,
    worldId: string,
    content: string,
    commentType: CommentType,
    mediaFile: Express.Multer.File
  ): Promise<Reply>;

  getReplyById(id: string): Promise<Reply>;

  getRepliesByCommentId(
    commentId: string,
    page?: number,
    limit?: number
  ): Promise<{ replies: Reply[], total: number, page: number, limit: number }>;

  updateReply(
    id: string,
    content: string,
    commentType: CommentType,
    mediaUrl?: string
  ): Promise<Reply>;

  deleteReply(id: string): Promise<void>;

  // Reaction methods
  addReaction(
    targetId: string,
    targetType: string,
    worldId: string,
    reactionType: ReactionType
  ): Promise<Reaction>;

  removeReaction(id: string): Promise<void>;

  getUserReaction(
    targetId: string,
    targetType: string,
    worldId: string
  ): Promise<Reaction | null>;
}
