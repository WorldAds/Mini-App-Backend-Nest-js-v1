import { CreativeType } from "../ValueObjects/CreativeType";

export interface AdvertisementInterface {
    _id: string;
    adsName: string;
    budget: number;
    startDate: Date;
    endDate: Date;
    targetAudience: string;
    locations: string[];
    creativeType: CreativeType;
    creativeURL: string;
}