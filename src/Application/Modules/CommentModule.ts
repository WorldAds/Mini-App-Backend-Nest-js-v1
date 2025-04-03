import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/Domain/Entities/Comment';
import { Reply } from 'src/Domain/Entities/Reply';
import { Reaction } from 'src/Domain/Entities/Reaction';
import { CommentController } from '../Controllers/comments/comment.controller';
import { CommentService } from 'src/Domain/Services/Comments/comment.service';
import { CommentRepository } from 'src/Domain/Infrastructure/Comments/CommentRepository';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Reply, Reaction])],
  controllers: [CommentController],
  providers: [
    CommentService,
    {
      provide: 'ICommentRepository',
      useClass: CommentRepository,
    },
  ],
  exports: [
    CommentService,
    {
      provide: 'ICommentRepository',
      useClass: CommentRepository,
    },
  ],
})
export class CommentModule {}
