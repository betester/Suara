import { TimeTogetherSpent, UserProfile } from "../models";

export interface TimeTogetherSpentService {
  get: (userId: string, limit: number) => Promise<TimeTogetherSpent[]>;
  updateTimeSpentWith: (
    user: UserProfile,
    otherUsers: UserProfile[],
  ) => Promise<void>;
  save: (
    timeTogetherSpents: TimeTogetherSpent[],
  ) => Promise<TimeTogetherSpent[]>;
}
