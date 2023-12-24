import { TimeTogetherSpent } from "../models";

export interface TimeTogetherSpentDataService<T extends TimeTogetherSpent> {
  //TODO: the return promise result is false change it on the future
  save: (data: T, filter?: any) => Promise<TimeTogetherSpent>;
  getOne: (filter: any) => Promise<T>;
  get: (filter: any, limit: number) => Promise<T[]>;
}
