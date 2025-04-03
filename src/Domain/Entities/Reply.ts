import { Entity, ObjectIdColumn, Column, ObjectId } from 'typeorm';
import { CommentType } from '../ValueObjects/CommentType';

@Entity()
export class Reply {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  commentId: string;

  @Column()
  userId: string;

  @Column()
  content: string;

  @Column()
  commentType: CommentType;

  @Column({ nullable: true })
  mediaUrl?: string;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  dislikeCount: number;

  constructor(
    commentId: string,
    userId: string,
    content: string,
    commentType: CommentType,
    mediaUrl?: string,
  ) {
    this.commentId = commentId;
    this.userId = userId;
    this.content = content;
    this.commentType = commentType;
    this.mediaUrl = mediaUrl;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.likeCount = 0;
    this.dislikeCount = 0;
  }
}
