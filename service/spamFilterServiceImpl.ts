import { User } from "../models";
import { SpamFilterService } from "./SpamFilterService";
import { UserDataService } from "./userDataService";

export class SpamFilterServiceImpl implements SpamFilterService {
  private userDataService: UserDataService
  private spamThreshold: number

  public constructor(userDataService: UserDataService, spamThreshold: number) {
    this.userDataService = userDataService
    this.spamThreshold = spamThreshold
  }

  public isSpamming(userId: string, guildId: string): Promise<boolean> {

    const promise: Promise<boolean> = new Promise<boolean>(
      (resolve, reject) => {
        this.userDataService
          .get(`${userId}:${guildId}`)
          .then(user => {
            const totalAction: number = user.totalConsecutiveJoins
            resolve(this.spamThreshold < totalAction)
          })
          .catch(error => {
            reject(error)
          })
      }
    )
    return promise
  }

  public countUserJoinOccurence(username: string, guildId: string) {

    const user: User = {
      username,
      guildId,
      totalConsecutiveJoins: 1
    }
    const spamKey: string = `${username}:${guildId}`
    this.userDataService
      .get(spamKey)
      .then((existingUser) => {
        user.totalConsecutiveJoins += existingUser.totalConsecutiveJoins
        this.userDataService.save(spamKey, user)
      })
      .catch((error) => {
        this.userDataService.save(spamKey, user)
      })
  }

}
