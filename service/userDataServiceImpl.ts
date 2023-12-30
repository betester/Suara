import { UserDataServiceGetManyArgs } from ".";
import { User } from "../models";
import { LocalStorage } from "./localStorage";
import { UserDataService } from "./userDataService";

export class UserDataServiceImpl<T extends User> implements UserDataService<T> {
  private localStorage: LocalStorage<T>;
  private ttl: number;

  constructor(localStorage: LocalStorage<T>, ttl: number) {
    this.localStorage = localStorage;
    this.ttl = ttl;
  }

  public getMany(args: UserDataServiceGetManyArgs): Promise<T[]> {
    throw new Error("No implementation");
  }

  public save(key: string, user: T) {
    this.localStorage.save(key, user, this.ttl);
  }

  public get(key: string): Promise<T | null> {
    return this.localStorage.get(key);
  }
}
