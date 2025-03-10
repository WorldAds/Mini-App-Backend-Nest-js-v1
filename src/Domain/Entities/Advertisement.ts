import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { CreativeType } from "../ValueObjects/CreativeType";
import { AdvertisementInterface } from "./AdvertisementInterface";

@Entity('advertisements')
export class Advertisement implements AdvertisementInterface {
    @ObjectIdColumn()
    _id: string;

    @Column()
    adsName: string;

    @Column()
    budget: number;

    @Column()
    startDate: Date;

    @Column()
    endDate: Date;

    @Column()
    targetAudience: string;

    @Column('array')
    locations: string[];

    @Column()
    creativeType: CreativeType;

    @Column()
    creativeURL: string;

    constructor(
        _id: string,
        adsName: string,
        budget: number,
        startDate: Date,
        endDate: Date,
        targetAudience: string,
        locations: string[],
        creativeType: CreativeType,
        creativeURL: string
    ) {
        this._id = _id;
        this.adsName = adsName;
        this.budget = budget;
        this.startDate = startDate;
        this.endDate = endDate;
        this.targetAudience = targetAudience;
        this.locations = locations;
        this.creativeType = creativeType;
        this.creativeURL = creativeURL;
    }
}
