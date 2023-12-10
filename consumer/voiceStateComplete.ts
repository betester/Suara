import { SpamFilterService } from "../service";
import jsLogger, { ILogger } from "js-logger"

jsLogger.useDefaults()
const Logger: ILogger = jsLogger.get("consumeVoiceStateComplete")

export const consumeVoiceStateComplete = (
  username: string,
  guildId : string,
  spamFilterService : SpamFilterService) => {

  try {
    spamFilterService.countUserJoinOccurence(username, guildId)
  } catch (error) {
    Logger.error(error)
  }
}
