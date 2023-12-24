import { TimeTogetherSpent } from "../models";
import { TimeTogetherSpentDataService } from "./timeTogetherSpentDataService";
import { TimeTogetherSpentService } from "./timeTogetherSpentService";

export class TimeTogetherSpentServiceImpl implements TimeTogetherSpentService {
  private timeTogetherSpentDataService: TimeTogetherSpentDataService<TimeTogetherSpent>;

  constructor(
    timeTogetherSpentDataService: TimeTogetherSpentDataService<TimeTogetherSpent>,
  ) {
    this.timeTogetherSpentDataService = timeTogetherSpentDataService;
  }

  public get(userId: string, limit: number): Promise<TimeTogetherSpent[]> {
    const filter = {
      $or: [{ userA: userId }, { userB: userId }],
    };

    return this.timeTogetherSpentDataService.get(filter, limit);
  }

  public async save(timeTogetherSpents: TimeTogetherSpent[]): Promise<void[]> {
    const promisesResult: Promise<TimeTogetherSpent>[] = [];
    const correctedIdOrder = timeTogetherSpents.map((timeSpent) =>
      this.setUserIdOrdering(timeSpent),
    );
    correctedIdOrder.forEach((timeSpent) => {
      const filter = {
        userA: timeSpent.userA,
        userB: timeSpent.userB,
      };
      promisesResult.push(this.timeTogetherSpentDataService.getOne(filter));
    });

    const allTimeSpents = await Promise.all(promisesResult);
    const allSaved = allTimeSpents.map((existingResult) => {
      for (let i = 0; i < correctedIdOrder.length; i++) {
        if (existingResult != null) {
          correctedIdOrder[i].timeSpentTogether +=
            existingResult.timeSpentTogether;
        }
        return this.timeTogetherSpentDataService.save(correctedIdOrder[i], {
          userA: correctedIdOrder[i].userA,
          userB: correctedIdOrder[i].userB,
        });
      }
    });

    return Promise.all(allSaved);
  }

  private setUserIdOrdering(data: TimeTogetherSpent): TimeTogetherSpent {
    // ensure that userA < userB
    const { userA, userB } = data;
    let newUserA = userA;
    let newUserB = userB;

    if (userA.localeCompare(userB) > 0) {
      newUserA = userB;
      newUserB = userA;
    }

    return {
      userA: newUserA,
      userB: newUserB,
      timeSpentTogether: data.timeSpentTogether,
    };
  }
}
