import { User } from "./user";

export interface UserSpam extends User {
  totalConsecutiveJoins : number
  guildId : string
}
