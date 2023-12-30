import { UserAction } from "../enums";
import { UserProfile } from "../models";
import { UserDataService } from "./userDataService";
import { UserProfileService } from "./userProfileService";
import jsLogger, { ILogger } from "js-logger";

jsLogger.useDefaults();

const Logger: ILogger = jsLogger.get("userProfileServiceImpl");

export class UserProfileServiceImpl implements UserProfileService {
  private userDataService: UserDataService<UserProfile>;

  constructor(userDataService: UserDataService<UserProfile>) {
    this.userDataService = userDataService;
  }

  public save(userProfile: UserProfile) {
    this.userDataService.save(userProfile.username, userProfile);
  }

  public saveByUserAction(userId: string, userAction: UserAction) {
    this.get(userId)
      .then((previousProfile) => {
        this.save(this.getUserProfile(userId, previousProfile, userAction));
      })
      .catch((error) => {
        Logger.error(error);
      });
  }

  public async get(
    userId: string,
    userInVoiceChannel: boolean,
  ): Promise<UserProfile> {
    try {
      const userProfile = await this.userDataService.get(userId);

      const currentTime = Date.now();

      let newTotalTimeSpent = 0;
      let newLastTimeJoined = currentTime;

      if (userProfile != null) {
        const { totalTimeSpent, lastTimeJoined } = userProfile;
        newTotalTimeSpent = totalTimeSpent;
        newLastTimeJoined = lastTimeJoined;

        if (userInVoiceChannel && lastUpTime < lastTimeJoined) {
          newTotalTimeSpent += currentTime - lastTimeJoined;
        }
      }
      userProfileEmbed.addFields({
        name: "Voice Channel Time Spent",
        value: utils.parseTime(newTotalTimeSpent),
      });

      if (userProfile || userInVoiceChannel) {
        this.userProfileService.save({
          totalTimeSpent: newTotalTimeSpent,
          lastTimeJoined: userInVoiceChannel ? currentTime : newLastTimeJoined,
          username: id,
          lastUserAction: userInVoiceChannel
            ? UserAction.JOIN
            : UserAction.LEAVE,
        });
      }

      return this.userDataService.get(userId);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public getMany(userIds: string[]): Promise<UserProfile[]> {
    try {
      return this.userDataService.getMany({
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

  public leaderboard(limit: number): Promise<UserProfile[]> {
    try {
      return this.userDataService.getMany({
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
