import { Entity, ObjectIdColumn, Column, ObjectId } from 'typeorm';
import { CreativeType } from '../ValueObjects/CreativeType';

@Entity()
export class Advertisement {
  @ObjectIdColumn()
  _id: ObjectId;

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

  @Column('simple-array')
  locations: string[];

  @Column()
  creativeType: CreativeType;

  @Column()
  creativeURL: string;

  constructor(
    adsName: string,
    budget: number,
    startDate: Date,
    endDate: Date,
    targetAudience: string,
    locations: string[],
    creativeType: CreativeType,
    creativeURL: string,
  ) {
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
