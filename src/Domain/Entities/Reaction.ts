import { Entity, ObjectIdColumn, Column, ObjectId } from 'typeorm';
import { ReactionType } from '../ValueObjects/ReactionType';

@Entity()
export class Reaction {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  targetId: string; // Can be either commentId or replyId

  @Column()
  targetType: string; // "Comment" or "Reply"

  @Column()
  worldId: string;

  @Column()
  reactionType: ReactionType;

  @Column()
  createdAt: Date;

  constructor(
    targetId: string,
    targetType: string,
    worldId: string,
    reactionType: ReactionType,
  ) {
    this.targetId = targetId;
    this.targetType = targetType;
    this.worldId = worldId;
    this.reactionType = reactionType;
    this.createdAt = new Date();
  }
}
