import { UserAction } from '../enums'
import { UserProfile } from '../models'

export interface UserProfileService {
  save : (userId : string, userAction : UserAction) => void
  get : (userId : string) => Promise<UserProfile>
}
