import { UserAction } from "../enums";
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

  public save(userId: string, userAction: UserAction) {
    this.get(userId)
      .then(previousProfile => {
        this.userDataService.save(
          userId,
          this.getUserProfile(
            userId, 
            previousProfile, 
            userAction
          )
        )
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

  private getUserProfile(userId: string, previousProfile: UserProfile, currentAction: UserAction): UserProfile {

    const currentTime: number = Date.now()
    let newTotalTimeSpent = 0

    if (previousProfile != null) {
      const { lastTimeJoined, totalTimeSpent, lastUserAction } = previousProfile
      newTotalTimeSpent = totalTimeSpent
      // ensure that if the machine were to died, it will keep track the correct time
      if (lastUserAction == UserAction.JOIN && currentAction == UserAction.LEAVE) {
        newTotalTimeSpent += currentTime - lastTimeJoined
      }
    }

    const userProfile: UserProfile = {
      username: userId,
      lastTimeJoined: currentTime,
      totalTimeSpent: newTotalTimeSpent,
      lastUserAction: currentAction,
    }

    return userProfile
  }

}
