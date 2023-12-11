import { User } from "."
export interface UserProfile extends User {
  totalTimeSpent : number
  lastTimeJoined : number
}
