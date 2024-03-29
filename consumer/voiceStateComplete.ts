import { Client, VoiceChannel } from "discord.js";
import { UserAction } from "../enums";
import {
  SpamFilterService,
  TimeTogetherSpentService,
  UserProfileService,
} from "../service";
import jsLogger, { ILogger } from "js-logger";

jsLogger.useDefaults();
const Logger: ILogger = jsLogger.get("consumeVoiceStateComplete");

const updateUserTimeSpentToghether = async (
  userAction: UserAction,
  client: Client,
  voiceChannelId: string,
  userProfileService: UserProfileService,
  userId: string,
  timeTogetherSpentService: TimeTogetherSpentService,
  guildId: string,
) => {
  try {
    if (userAction == UserAction.LEAVE) {
      const channel: VoiceChannel = (await client.channels.fetch(
        voiceChannelId,
      )) as VoiceChannel;
      const userIds = channel.members.map((member) => member.id);

      const userProfiles = await userProfileService.getMany(userIds, guildId);
      const leavingUserProfile = await userProfileService.get(userId, guildId);
      await timeTogetherSpentService.updateTimeSpentWith(
        leavingUserProfile,
        userProfiles,
      );
    }
  } catch (error) {
    Logger.error(error);
  }
};

export const consumeVoiceStateComplete = async (
  client: Client,
  voiceChannelId: string,
  userId: string,
  guildId: string,
  userAction: UserAction,
  spamFilterService: SpamFilterService,
  userProfileService: UserProfileService,
  timeTogetherSpentService: TimeTogetherSpentService,
) => {
  try {
    spamFilterService.countUserJoinOccurence(userId, guildId);
    await updateUserTimeSpentToghether(
      userAction,
      client,
      voiceChannelId,
      userProfileService,
      userId,
      timeTogetherSpentService,
      guildId,
    );
    userProfileService.saveByUserAction(userId, guildId, userAction);
  } catch (error) {
    Logger.error(error);
  }
};
