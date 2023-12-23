import { Client, VoiceChannel } from "discord.js";
import { UserAction } from "../enums";
import { SpamFilterService, TimeTogetherSpentService, UserProfileService } from "../service";
import jsLogger, { ILogger } from "js-logger";
import { TimeTogetherSpent } from "../models";

jsLogger.useDefaults();
const Logger: ILogger = jsLogger.get("consumeVoiceStateComplete");


const updateUserTimeSpentToghether = async (
  userAction: UserAction,
  client: Client,
  voiceChannelId: string,
  userProfileService: UserProfileService,
  userId: string,
  timeTogetherSpentService: TimeTogetherSpentService
) => {
  try {
    if (userAction == UserAction.LEAVE) {
      const channel: VoiceChannel = await client.channels.fetch(voiceChannelId) as VoiceChannel
      const userIds = channel.members.map(member => member.id)

      const userProfiles = await userProfileService.getMany(userIds)
      const leavingUserProfile = await userProfileService.get(userId)

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
    }

  } catch (error) {
    Logger.info(error)
  }
}

export const consumeVoiceStateComplete = async (
  client: Client,
  voiceChannelId: string,
  userId: string,
  guildId: string,
  userAction: UserAction,
  spamFilterService: SpamFilterService,
  userProfileService: UserProfileService,
  timeTogetherSpentService: TimeTogetherSpentService
) => {
  try {
    spamFilterService.countUserJoinOccurence(userId, guildId);
    await updateUserTimeSpentToghether(
      userAction,
      client,
      voiceChannelId,
      userProfileService,
      userId,
      timeTogetherSpentService
    )
    userProfileService.saveByUserAction(userId, userAction);
  } catch (error) {
    Logger.error(error);
  } finally {
  }
};
