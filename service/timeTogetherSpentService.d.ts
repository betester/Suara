import { TimeTogetherSpent } from "../models";

export interface TimeTogetherSpentService<T extends TimeTogetherSpent> {
  save : (data : T) => void
  get : (key : string) => Promise<T>
}
