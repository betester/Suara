import { User } from "../models";

interface UserDataService {
  save : (key : string, user: User) => void
  get : (key : string) => Promise<User|null>
}
