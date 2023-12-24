import { UserAction } from "../enums";
import { UserProfile } from "../models";

export interface UserProfileService {
  save: (userProfile: UserProfile) => void;
  saveByUserAction: (userId: string, userAction: UserAction) => void;
  get: (userId: string) => Promise<UserProfile>;
  getMany: (userIds: string[]) => Promise<UserProfile[]>
}
