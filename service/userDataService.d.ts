import { User } from "../models";

export interface UserDataServiceGetManyArgs {
  filter?: any;
  limit?: number;
  sortBy?: any;
}

interface UserDataService<T extends User> {
  save: (key: string, user: T) => void;
  get: (key: string) => Promise<T>;
  getMany: (args: UserDataServiceGetManyArgs) => Promise<T[]>;
}
