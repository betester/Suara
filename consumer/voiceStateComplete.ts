import { SpamFilterService, UserProfileService } from "../service";
import jsLogger, { ILogger } from "js-logger"

jsLogger.useDefaults()
const Logger: ILogger = jsLogger.get("consumeVoiceStateComplete")

export const consumeVoiceStateComplete = (
  userId: string,
  guildId : string,
  spamFilterService : SpamFilterService,
  userProfileService : UserProfileService
) => {

  try {
    spamFilterService.countUserJoinOccurence(userId, guildId)
    userProfileService.save(userId)
  } catch (error) {
    Logger.error(error)
  }
}
