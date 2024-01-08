import { UserAction } from "../enums";
import { UserProfile } from "../models";
import { UserDataServiceFactory } from "./userDataServiceFactory";
import { UserProfileService } from "./userProfileService";
import jsLogger, { ILogger } from "js-logger";

jsLogger.useDefaults();

const Logger: ILogger = jsLogger.get("userProfileServiceImpl");

export class UserProfileServiceImpl implements UserProfileService {
  private userDataServiceFactory: UserDataServiceFactory;

  constructor(userDataServiceFactory: UserDataServiceFactory) {
    this.userDataServiceFactory = userDataServiceFactory;
  }

  public save(userProfile: UserProfile, guildId: string) {
    const userDataService =
      this.userDataServiceFactory.get<UserProfile>(guildId);
    userDataService.save(userProfile.username, userProfile);
  }

  public async saveByUserAction(
    userId: string,
    guildId: string,
    userAction: UserAction,
  ): Promise<UserProfile> {
    return this.get(userId, guildId)
      .then((previousProfile) => {
        const newUserProfile = this.getUserProfile(
          userId,
          previousProfile,
          userAction,
        );
        this.save(newUserProfile, guildId);
        return newUserProfile;
      })
      .catch((error) => {
        Logger.error(error);
        return null;
      });
  }

  public get(userId: string, guildId: string): Promise<UserProfile> {
    try {
      const userDataService =
        this.userDataServiceFactory.get<UserProfile>(guildId);
      return userDataService.get(userId);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public getCurrentUserInVoiceChannel(guildId: string): Promise<UserProfile[]> {
    try {
      const userDataService =
        this.userDataServiceFactory.get<UserProfile>(guildId);
      return userDataService.getMany({
        filter: {
          lastUserAction: UserAction.JOIN,
        },
      });
    } catch (error) {
      Logger.error(error);
    }
  }

  public getMany(userIds: string[], guildId: string): Promise<UserProfile[]> {
    try {
      const userDataService =
        this.userDataServiceFactory.get<UserProfile>(guildId);
      return userDataService.getMany({
        filter: {
          username: {
            $in: userIds,
          },
        },
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public leaderboard(limit: number, guildId: string): Promise<UserProfile[]> {
    try {
      const userDataService =
        this.userDataServiceFactory.get<UserProfile>(guildId);
      return userDataService.getMany({
        limit,
        sortBy: {
          totalTimeSpent: -1,
        },
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  private getUserProfile(
    userId: string,
    previousProfile: UserProfile,
    currentAction: UserAction,
  ): UserProfile {
    const currentTime: number = Date.now();
    let newTotalTimeSpent = 0;

    if (previousProfile != null) {
      const { lastTimeJoined, totalTimeSpent, lastUserAction } =
        previousProfile;
      newTotalTimeSpent = totalTimeSpent;
      // ensure that if the machine were to died, it will keep track the correct time
      if (
        lastUserAction == UserAction.JOIN &&
        currentAction == UserAction.LEAVE
      ) {
        newTotalTimeSpent += currentTime - lastTimeJoined;
      }
    }

    const userProfile: UserProfile = {
      username: userId,
      lastTimeJoined: currentTime,
      totalTimeSpent: newTotalTimeSpent,
      lastUserAction: currentAction,
    };

    return userProfile;
  }
}
