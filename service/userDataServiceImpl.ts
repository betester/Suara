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
  
  public save(key : string, user : User) {
    this.localStorage.save(key, user, this.ttl)
  }
  
  public get(key : string) : Promise<User | null> {
    return this.localStorage.get(key)
  }
}
