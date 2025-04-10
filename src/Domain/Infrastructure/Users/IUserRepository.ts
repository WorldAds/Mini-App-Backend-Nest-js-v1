import { User } from "src/Domain/Entities/User";

export interface IUserRepository {
  create(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByWorldId(worldId: string): Promise<User | null>;
  update(id: string, user: Partial<User>): Promise<User>;
  updateAvatar(id: string, avatarUrl: string): Promise<User>;
  updateNickname(id: string, nickname: string): Promise<User>;
  updateWalletBalance(id: string, balance: number): Promise<User>;
  exists(worldId: string): Promise<boolean>;
}
