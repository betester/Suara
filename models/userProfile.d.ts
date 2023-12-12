import { User } from "."
import { UserAction } from "../enums"

export interface UserProfile extends User {
  totalTimeSpent : number
  lastTimeJoined : number
  lastUserAction : UserAction
}
