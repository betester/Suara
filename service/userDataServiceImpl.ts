import { User } from "../models";
import { LocalStorage } from "./localStorage";
import { UserDataService } from "./userDataService";

export class UserDataServiceImpl implements UserDataService {
  private localStorage : LocalStorage<User>
  private ttl : number 


  constructor(localStorage : LocalStorage<User>, ttl : number) {
    this.localStorage = localStorage
    this.ttl = ttl
  }
  
  public save(user : User) {
    this.localStorage.save(`${user.username}:${user.guildId}`, user, this.ttl)
  }
  
  public get(username : string, guildId : string) : Promise<User | null> {
    return this.localStorage.get(`${username}:${guildId}`)
  }
}
