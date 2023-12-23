import { User } from "../models";

interface UserDataService<T extends User> {
  save: (key: string, user: T) => void;
  get: (key: string) => Promise<T>;
  getMany: (key: string[]) => Promise<T[]>;
}
