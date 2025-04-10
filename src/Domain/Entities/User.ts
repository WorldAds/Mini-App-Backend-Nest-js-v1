import { Entity, ObjectIdColumn, Column, ObjectId } from 'typeorm';

@Entity()
export class User {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  worldId: string;

  @Column()
  nickname: string;



  @Column({ nullable: true })
  avatarUrl?: string;

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
    walletAddress: string,
    walletBalance: number = 0,
    avatarUrl?: string,
  ) {
    this.worldId = worldId;
    this.nickname = nickname;
    this.walletAddress = walletAddress;
    this.walletBalance = walletBalance;
    this.avatarUrl = avatarUrl;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}