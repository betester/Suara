import { UserProfile } from '../models'

export interface UserProfileService {
  save : (userProfile : UserProfile) => void
  get : (userId : string) => Promise<UserProfile | null>
}
