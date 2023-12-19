import { TimeTogetherSpent } from "../models";

export interface TimeTogetherSpentDataService<T extends TimeTogetherSpent> {
  save : (data : T) => void
  get : (key : string) => Promise<T>
}
