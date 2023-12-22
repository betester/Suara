import { TimeTogetherSpent } from "../models";
import { TimeTogetherSpentDataService } from "./timeTogetherSpentDataService";
import { TimeTogetherSpentService } from "./timeTogetherSpentService";

export class TimeTogetherSpentServiceImpl implements TimeTogetherSpentService {

  private timeTogetherSpentDataService: TimeTogetherSpentDataService<TimeTogetherSpent>

  constructor(timeTogetherSpentDataService: TimeTogetherSpentDataService<TimeTogetherSpent>) {
    this.timeTogetherSpentDataService = timeTogetherSpentDataService
  }

  public get(userId: string, limit: number): Promise<TimeTogetherSpent[]> {
    const filter = {
      $or: [
        { userA: userId },
        { userB: userId }
      ]
    }

    return this.timeTogetherSpentDataService.get(filter, limit)
  }

  public save(timeTogetherSpents: TimeTogetherSpent[]) {

    const promisesResult: Promise<TimeTogetherSpent>[] = []

    timeTogetherSpents.forEach(timeSpent => {
      const filter = {
        userA: timeSpent.userA,
        userB: timeSpent.userB
      }
      promisesResult.push(this.timeTogetherSpentDataService.getOne(filter))
    })

    Promise
      .all(promisesResult)
      .then(existingResults => {
        for (let i = 0; i < timeTogetherSpents.length; i++) {
          if (existingResults[i] != null) {
            timeTogetherSpents[i].timeSpentTogether += existingResults[i].timeSpentTogether
          }
          this.timeTogetherSpentDataService.save(timeTogetherSpents[i])
        }
      })
  }
}
