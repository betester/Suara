import { UserProfile } from '../models'

export interface UserProfileService {
  save : (userId : string) => void
  get : (userId : string) => Promise<UserProfile>
}
