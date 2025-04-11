import { Entity, ObjectIdColumn, Column, ObjectId } from 'typeorm';
import { CommentType } from '../ValueObjects/CommentType';

@Entity()
export class Comment {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  advertisementId: string;

  @Column()
  worldId: string;

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

  @Column({ default: 0 })
  replyCount: number;

  constructor(
    advertisementId: string,
    worldId: string,
    content: string,
    commentType: CommentType,
    mediaUrl?: string,
  ) {
    this.advertisementId = advertisementId;
    this.worldId = worldId;
    this.content = content;
    this.commentType = commentType;
    this.mediaUrl = mediaUrl;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.likeCount = 0;
    this.dislikeCount = 0;
    this.replyCount = 0;
  }
}
