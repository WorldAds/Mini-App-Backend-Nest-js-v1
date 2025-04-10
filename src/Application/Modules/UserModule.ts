import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/Domain/Entities/User';
import { UserController } from '../Controllers/users/user.controller';
import { UserService } from 'src/Domain/Services/Users/user.service';
import { UserRepository } from 'src/Domain/Infrastructure/Users/UserRepository';
import { FileUploadModule } from 'src/infrastructure/file-upload/file-upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    FileUploadModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
  ],
  exports: [
    UserService,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
  ],
})
export class UserModule {}
