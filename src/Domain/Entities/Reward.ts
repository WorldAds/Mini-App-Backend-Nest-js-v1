import { Entity, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity()
export class Reward {
    @ObjectIdColumn()
    _id: ObjectId;

    @Column()
    worldId: string;

    @Column()
    adId: string;

    @Column()
    rewardedAmount: number;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ nullable: true })
    chainId?: string;

    @Column({ nullable: true })
    txHash?: string;

    constructor(
        worldId: string,
        adId: string,
        rewardedAmount: number,
        chainId?: string,
        txHash?: string
    ) {
        this.worldId = worldId;
        this.adId = adId;
        this.rewardedAmount = rewardedAmount;
        this.chainId = chainId;
        this.txHash = txHash;
    }
}
