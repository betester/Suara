import { UserProfile } from "../models";
import { UserDataService } from "./userDataService";
import { UserProfileService } from "./userProfileService";
import jsLogger, { ILogger } from "js-logger"

jsLogger.useDefaults()

const Logger: ILogger = jsLogger.get("userProfileServiceImpl")

export class UserProfileServiceImpl implements UserProfileService {

  private userDataService: UserDataService<UserProfile>

  constructor(userDataService: UserDataService<UserProfile>) {
    this.userDataService = userDataService
  }

  public save(userId: string) {
    this.get(userId)
      .then(previousProfile => {
        const userProfile: UserProfile = {
          username: userId,
          totalTimeSpent: previousProfile == null ? 0 : previousProfile.totalTimeSpent + Date.now() - previousProfile.lastTimeJoined,
          lastTimeJoined: Date.now()
        }
        this.userDataService.save(userId, userProfile)
      })
      .catch(error => {
        Logger.error(error)
      })

  }
  public get(userId: string): Promise<UserProfile> {
    try {
      return this.userDataService.get(userId)
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
