import { Client, VoiceChannel } from "discord.js";
import { UserAction } from "../enums";
import { SpamFilterService, TimeTogetherSpentService, UserProfileService } from "../service";
import jsLogger, { ILogger } from "js-logger";
import { TimeTogetherSpent } from "../models";

jsLogger.useDefaults();
const Logger: ILogger = jsLogger.get("consumeVoiceStateComplete");

export const consumeVoiceStateComplete = (
  client: Client,
  voiceChannelId: string,
  userId: string,
  guildId: string,
  userAction: UserAction,
  spamFilterService: SpamFilterService,
  userProfileService: UserProfileService,
  timeTogetherSpentService : TimeTogetherSpentService
) => {
  try {
    spamFilterService.countUserJoinOccurence(userId, guildId);

    if (userAction == UserAction.LEAVE) {
      client
        .channels
        .fetch(voiceChannelId)
        .then(async (channel: VoiceChannel) => {
          const userIds = channel.members.map(member => member.id)

          const userProfiles = await userProfileService.getMany(userIds)
          const idxOfLeavingUser = userProfiles.map(userProfile => userProfile.username).indexOf(userId)
          const leavingUserProfile = userProfiles.splice(idxOfLeavingUser, 1)[0]

          const lastUpTime = client.readyAt
          const currentTime = Date.now()

          const timeTogetherSpent: TimeTogetherSpent[] = []

          userProfiles.forEach(userProfile => {

            // handles whenever machine died and the user still joins
            if (lastUpTime.getMilliseconds() < userProfile.lastTimeJoined) {
              timeTogetherSpent.push(
                {
                  userA: userId,
                  userB: userProfile.username,
                  timeSpentTogether: Math.min(
                    currentTime - leavingUserProfile.lastTimeJoined,
                    currentTime - userProfile.lastTimeJoined
                  )
                }
              )
            }
          })

          timeTogetherSpentService.save(timeTogetherSpent)
        })
    }
    userProfileService.saveByUserAction(userId, userAction);
  } catch (error) {
    Logger.error(error);
  }
};
