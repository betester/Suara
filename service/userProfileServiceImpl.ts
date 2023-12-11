import { UserAction } from "../enums";
import { User, UserProfile } from "../models";
import { UserDataService } from "./userDataService";
import { UserProfileService } from "./userProfileService";

export class UserProfileServiceImpl implements UserProfileService {

  private userDataService: UserDataService<UserProfile>

  constructor(userDataService: UserDataService<UserProfile>) {
    this.userDataService = userDataService
  }

  public async saveByUserAction(user : User, userAction: UserAction) {
    const previousProfile : UserProfile = await this.get(user.username)
    const previousTotalTimeSpent : number = previousProfile != null ? previousProfile.totalTimeSpent : 0
    // consider using another abstraction to handle if else to avoid long branching
    if (userAction == UserAction.JOIN) {
      const userProfile : UserProfile = {
        username : user.username,
        totalTimeSpent : previousTotalTimeSpent, 
        lastTimeJoined : Date.now()
      }
      this.userDataService.save(user.username, userProfile)
    } else if (userAction == UserAction.LEAVE) {
      const userProfile : UserProfile = {
        username : user.username,
        totalTimeSpent : previousTotalTimeSpent + Date.now() - previousProfile.lastTimeJoined, 
        lastTimeJoined : Date.now()
      }
      this.userDataService.save(user.username, userProfile)
    }
  }
  public get(userId: string): Promise<UserProfile> {
    return this.userDataService.get(userId)
  }
}
