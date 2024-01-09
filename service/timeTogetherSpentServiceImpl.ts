import { TimeTogetherSpent, UserProfile } from "../models";
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

  public updateTimeSpentWith(
    user: UserProfile,
    otherUsers: UserProfile[],
  ): Promise<void> {
    try {
      const timeTogetherSpent: TimeTogetherSpent[] = [];
      const currentTime = Date.now();
      otherUsers.forEach((userProfile) => {
        timeTogetherSpent.push({
          userA: user.username,
          userB: userProfile.username,
          timeSpentTogether: Math.min(
            currentTime - user.lastTimeJoined,
            currentTime - userProfile.lastTimeJoined,
          ),
        });
      });

      this.save(timeTogetherSpent);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject();
    }
  }

  public async save(
    timeTogetherSpents: TimeTogetherSpent[],
  ): Promise<TimeTogetherSpent[]> {
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
    const allSaved: Promise<TimeTogetherSpent>[] = [];

    for (let i = 0; i < correctedIdOrder.length; i++) {
      if (allTimeSpents[i] != null) {
        correctedIdOrder[i].timeSpentTogether +=
          allTimeSpents[i].timeSpentTogether;
      }
      allSaved.push(
        this.timeTogetherSpentDataService.save(correctedIdOrder[i], {
          userA: correctedIdOrder[i].userA,
          userB: correctedIdOrder[i].userB,
        }),
      );
    }

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
