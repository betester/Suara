import { UserAction } from "../enums";
import { UserProfile } from "../models";

export interface UserProfileService {
  save: (userProfile: UserProfile, guildId: string) => void;
  saveByUserAction: (
    userId: string,
    guildId: string,
    userAction: UserAction,
  ) => Promise<UserProfile>;
  get: (userId: string, guildId: string) => Promise<UserProfile>;
  getMany: (userIds: string[], guildId: string) => Promise<UserProfile[]>;
  getCurrentUserInVoiceChannel: (guildId: string) => Promise<UserProfile[]>;
  leaderboard: (limit: number, guildId: string) => Promise<UserProfile[]>;
}
