import {
  Client,
  TextChannel,
  VoiceState,
  VoiceChannel,
  EmbedBuilder,
  EmbedAuthorOptions,
} from "discord.js";
import { UserAction } from "../enums";
import jsLogger from "js-logger";
import { voiceChannelEmbeds } from "../client/embeds";
import { SpamFilterService, UserProfileService } from "../service";

jsLogger.useDefaults();
const Logger = jsLogger.get("voiceChannelConsumer");

const consumeUserAction = (
  client: Client,
  voiceChannelState: VoiceState,
  action: UserAction,
  spamFilterSerivice: SpamFilterService,
) => {
  const systemChannel: TextChannel = voiceChannelState.guild.systemChannel;

  client.users
    .fetch(voiceChannelState.id)
    .then((user) => {
      client.channels
        .fetch(voiceChannelState.channelId)
        .then((channel: VoiceChannel) => {
          const description: string = `${action} ${channel.name} voice chat`;
          const author: EmbedAuthorOptions = {
            iconURL: user.avatarURL(),
            name: user.username,
          };
          const embeds: EmbedBuilder[] = [
            voiceChannelEmbeds(action, description, author),
          ];
          spamFilterSerivice
            .isSpamming(user.id, voiceChannelState.guild.id)
            .then((userIsSpamming) => {
              if (!userIsSpamming) {
                systemChannel.send({ embeds });
              }
            })
            .catch((error) => {
              Logger.error(error);
              systemChannel.send({ embeds });
            });
        });
    })
    .catch((error) => {
      Logger.error(error);
    });
};
export const voiceStateConsumer = (
  client: Client,
  voiceChannelOldState: VoiceState,
  voiceChannelNewState: VoiceState,
  spamFilterService: SpamFilterService,
) => {
  // the user could have been mute, deafen, and any other action
  const otherVoiceChannelAction: boolean =
    voiceChannelOldState.channel == voiceChannelNewState.channel;

  if (otherVoiceChannelAction) {
    return;
  }

  let voiceChannelState: VoiceState;
  let userAction: UserAction;

  if (voiceChannelNewState.channel != null) {
    voiceChannelState = voiceChannelNewState;
    userAction = UserAction.JOIN;
    consumeUserAction(
      client,
      voiceChannelNewState,
      userAction,
      spamFilterService,
    );
  } else if (voiceChannelOldState.channel != null) {
    voiceChannelState = voiceChannelOldState;
    userAction = UserAction.LEAVE;
    consumeUserAction(
      client,
      voiceChannelOldState,
      userAction,
      spamFilterService,
    );
  }

  client.emit(
    "voiceStateComplete",
    voiceChannelState.id,
    voiceChannelState.guild.id,
    userAction,
  );
};
