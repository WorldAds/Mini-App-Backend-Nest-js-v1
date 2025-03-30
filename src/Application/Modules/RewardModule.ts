import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardController } from '../Controllers/managements/rewards.controller';
import { RewardService } from 'src/Domain/Services/Rewards/rewards.service';
import { Reward } from 'src/Domain/Entities/Reward';
import { RewardRepository } from 'src/Domain/Infrastructure/Rewards/RewardRepository';
import { AdvertisementModule } from './AdvertisementModule';

@Module({
    imports: [
        TypeOrmModule.forFeature([Reward]), // Make sure Reward is included here
        AdvertisementModule,
    ],
    controllers: [RewardController],
    providers: [
        RewardService,
        {
            provide: 'IRewardRepository',
            useClass: RewardRepository,
        }
    ],
    exports: [RewardService],
})
export class RewardModule {}
