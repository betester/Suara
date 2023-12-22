import { TimeTogetherSpent } from "../models";

export interface TimeTogetherSpentService {
  get : (userId : string, limit : number) => Promise<TimeTogetherSpent[]>
  save : (timeTogetherSpents: TimeTogetherSpent[]) => void
}
