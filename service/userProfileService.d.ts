import { UserAction } from '../enums'
import { UserProfile } from '../models'

export interface UserProfileService {
  saveByUserAction : (userProfile : UserProfile, userAction : UserAction) => void
  get : (userId : string) => Promise<UserProfile>
}
