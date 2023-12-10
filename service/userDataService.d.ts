import { User } from "../models";

interface UserDataService {
  save : (user : User) => void
  get : (username : string, guildId : string) => Promise<User|null>
}
