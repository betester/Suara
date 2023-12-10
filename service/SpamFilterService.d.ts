import { User } from "../models";

export interface SpamFilterService {
  isSpamming : (userId : string, guildId : string) => Promise<boolean>
}
