import { User } from ".";
export interface UserSpam extends User {
  totalConsecutiveJoins: number;
  guildId: string;
}
