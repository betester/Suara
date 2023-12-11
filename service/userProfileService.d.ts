import { UserAction } from '../enums'
import { UserProfile } from '../models'

export interface UserProfileService {
  saveByUserAction : (userId : string, userAction : UserAction) => void
  get : (userId : string) => Promise<UserProfile>
}
