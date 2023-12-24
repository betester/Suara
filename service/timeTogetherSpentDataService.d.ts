import { TimeTogetherSpent } from "../models";

export interface TimeTogetherSpentDataService<T extends TimeTogetherSpent> {
  save: (data: T, filter?: any) => void
  getOne: (filter: any) => Promise<T>
  get: (filter: any, limit: number) => Promise<T[]>
}
