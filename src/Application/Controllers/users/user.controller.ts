import { Controller, Post, Body, HttpStatus, Logger, Get, Param, Put, NotFoundException } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UserDTO, CreateUserDTO, LoginUserDTO, UpdateAvatarDTO, UpdateNicknameDTO, UpdateWalletBalanceDTO } from 'src/Application/DTOs/users/UserDTO';
import { UserService } from 'src/Domain/Services/Users/user.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('api/v1/users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The user has been successfully created.',
    type: UserDTO,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User with this World ID already exists.',
  })
  async createUser(@Body() createUserDto: CreateUserDTO) {
    this.logger.log('Received request to create user');
    const result = await this.userService.createUser(
      createUserDto.worldId,
      createUserDto.nickname,
      createUserDto.walletAddress
    );
    return result;
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user or create if not exists' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User logged in successfully.',
    type: UserDTO,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  async loginUser(@Body() loginUserDto: LoginUserDTO) {
    this.logger.log('Received request to login user');
    const result = await this.userService.loginUser(
      loginUserDto.worldId,
      loginUserDto.walletAddress
    );
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user has been found',
    type: UserDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async getUserById(@Param('id') id: string) {
    this.logger.log(`Received request to get user with ID: ${id}`);
    const result = await this.userService.getUserById(id);
    return result;
  }

  @Get('world/:worldId')
  @ApiOperation({ summary: 'Get user by World ID' })
  @ApiParam({
    name: 'worldId',
    required: true,
    description: 'The World ID of the user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user has been found',
    type: UserDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async getUserByWorldId(@Param('worldId') worldId: string) {
    this.logger.log(`Received request to get user with World ID: ${worldId}`);
    const result = await this.userService.getUserByWorldId(worldId);
    return result;
  }

  @Put(':id/avatar')
  @ApiOperation({ summary: 'Update user avatar' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The avatar has been successfully updated.',
    type: UserDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  async updateAvatar(
    @Param('id') id: string,
    @Body() updateAvatarDto: UpdateAvatarDTO,
  ) {
    this.logger.log(`Received request to update avatar for user with ID: ${id}`);
    const result = await this.userService.updateUserAvatar(
      id,
      updateAvatarDto.avatarType,
      updateAvatarDto.avatarUrl,
    );
    return result;
  }

  @Put(':id/nickname')
  @ApiOperation({ summary: 'Update user nickname' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The nickname has been successfully updated.',
    type: UserDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  async updateNickname(
    @Param('id') id: string,
    @Body() updateNicknameDto: UpdateNicknameDTO,
  ) {
    this.logger.log(`Received request to update nickname for user with ID: ${id}`);
    const result = await this.userService.updateUserNickname(
      id,
      updateNicknameDto.nickname,
    );
    return result;
  }

  @Put(':id/wallet-balance')
  @ApiOperation({ summary: 'Update user wallet balance' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The wallet balance has been successfully updated.',
    type: UserDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  async updateWalletBalance(
    @Param('id') id: string,
    @Body() updateWalletBalanceDto: UpdateWalletBalanceDTO,
  ) {
    this.logger.log(`Received request to update wallet balance for user with ID: ${id}`);
    const result = await this.userService.updateWalletBalance(
      id,
      updateWalletBalanceDto.walletBalance,
    );
    return result;
  }
}
