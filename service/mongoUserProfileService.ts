import { UserProfile } from "../models";
import { UserDataService } from "./userDataService";
import { UserProfileService } from "./userProfileService";

export class UserProfileServiceImpl implements UserProfileService {

  private userDataService: UserDataService<UserProfile>

  constructor(userDataService: UserDataService<UserProfile>) {
    this.userDataService = userDataService
  }

  public save(userProfile: UserProfile) {
    this.userDataService.save(userProfile.username, userProfile)
  }

  public get(userId: string) : Promise<UserProfile> {
    return this.userDataService.get(userId)
  }
}
