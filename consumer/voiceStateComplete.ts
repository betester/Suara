import { UserAction } from "../enums";
import { SpamFilterService, UserProfileService } from "../service";
import jsLogger, { ILogger } from "js-logger"

jsLogger.useDefaults()
const Logger: ILogger = jsLogger.get("consumeVoiceStateComplete")

export const consumeVoiceStateComplete = (
  userId: string,
  guildId : string,
  userAction : UserAction,
  spamFilterService : SpamFilterService,
  userProfileService : UserProfileService
) => {

  try {
    spamFilterService.countUserJoinOccurence(userId, guildId)
    userProfileService.saveByUserAction(userId, userAction)
  } catch (error) {
    Logger.error(error)
  }
}
