import { Entity, ObjectIdColumn, Column, ObjectId } from 'typeorm';
import { AvatarType } from '../ValueObjects/AvatarType';

@Entity()
export class User {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  worldId: string;

  @Column()
  nickname: string;

  @Column()
  avatarType: AvatarType;

  @Column()
  avatarUrl: string;

  @Column()
  walletAddress: string;

  @Column()
  walletBalance: number;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  constructor(
    worldId: string,
    nickname: string,
    avatarType: AvatarType,
    avatarUrl: string,
    walletAddress: string,
    walletBalance: number = 0,
  ) {
    this.worldId = worldId;
    this.nickname = nickname;
    this.avatarType = avatarType;
    this.avatarUrl = avatarUrl;
    this.walletAddress = walletAddress;
    this.walletBalance = walletBalance;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}