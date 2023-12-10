import { User } from "../models";
import { UserDataService } from "../service";
import jsLogger, { ILogger } from "js-logger"

jsLogger.useDefaults()
const Logger: ILogger = jsLogger.get("consumeVoiceStateComplete")

export const consumeVoiceStateComplete = (
  username: string,
  guildId : string,
  userDataService: UserDataService) => {

  const user: User = {
    username,
    guildId,
    totalConsecutiveJoins: 1
  }

  try {
    userDataService
      .get(username, guildId)
      .then((existingUser) => {
        user.totalConsecutiveJoins += existingUser.totalConsecutiveJoins
        userDataService.save(user)
      })
      .catch((error) => {
        Logger.error(error)
        userDataService.save(user)
      })

  } catch (error) {
    Logger.error(error)
  }
}
