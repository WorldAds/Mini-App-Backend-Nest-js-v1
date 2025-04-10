import { User } from "src/Domain/Entities/User";

export interface IUserService {
  createUser(worldId: string, nickname: string, walletAddress: string): Promise<User>;
  getUserById(id: string): Promise<User>;
  getUserByWorldId(worldId: string): Promise<User>;
  updateUserAvatar(id: string, avatarType: string, avatarUrl: string): Promise<User>;
  uploadAvatar(id: string, file: Express.Multer.File): Promise<User>;
  updateUserNickname(id: string, nickname: string): Promise<User>;
  updateWalletBalance(id: string, balance: number): Promise<User>;
  loginUser(worldId: string, walletAddress: string): Promise<User>;
}
