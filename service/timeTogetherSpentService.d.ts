import { TimeTogetherSpent, UserProfile } from "../models";

export interface TimeTogetherSpentService {
  get: (guildId: string, userId: string, limit: number) => Promise<TimeTogetherSpent[]>;
  updateTimeSpentWith: (
    guildId: string,
    user: UserProfile,
    otherUsers: UserProfile[],
  ) => Promise<void>;
  save: (
    guildId: string,
    timeTogetherSpents: TimeTogetherSpent[],
  ) => Promise<TimeTogetherSpent[]>;
}
