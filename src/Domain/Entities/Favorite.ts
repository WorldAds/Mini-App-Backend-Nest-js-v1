import { Entity, ObjectIdColumn, Column, ObjectId, CreateDateColumn } from 'typeorm';

@Entity()
export class Favorite {
    @ObjectIdColumn()
    _id: ObjectId;

    @Column()
    adId: string;

    @Column()
    worldId: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ nullable: true })
    note?: string;

    @Column({ nullable: true })
    chainId?: string;

    @Column({ nullable: true })
    txHash?: string;

    constructor(
        adId: string,
        worldId: string,
        note?: string,
        chainId?: string,
        txHash?: string
    ) {
        this.adId = adId;
        this.worldId = worldId;
        this.note = note;
        this.chainId = chainId;
        this.txHash = txHash;
    }
}