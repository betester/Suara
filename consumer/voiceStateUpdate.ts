import { Client, TextChannel, VoiceState, VoiceChannel, EmbedBuilder, EmbedAuthorOptions } from "discord.js";
import { UserAction } from "../enums";
import jsLogger from 'js-logger'
import { voiceChannelEmbeds } from "../client/embeds";
import { SpamFilterService, UserProfileService } from "../service";

jsLogger.useDefaults()
const Logger = jsLogger.get("voiceChannelConsumer")

const consumeUserAction = (
  client: Client,
  voiceChannelState: VoiceState,
  action: UserAction,
  spamFilterSerivice: SpamFilterService,
  userProfileService : UserProfileService
) => {

  const systemChannel: TextChannel = voiceChannelState.guild.systemChannel

  client.users
    .fetch(voiceChannelState.id)
    .then((user) => {
      userProfileService.saveByUserAction(user.id, action)
      client.channels
        .fetch(voiceChannelState.channelId)
        .then((channel: VoiceChannel) => {
          const description: string = `${action} ${channel.name} voice chat`
          const author: EmbedAuthorOptions = {
            iconURL: user.avatarURL(),
            name: user.username
          }
          const embeds: EmbedBuilder[] = [voiceChannelEmbeds(action, description, author)]
          spamFilterSerivice
            .isSpamming(user.id, voiceChannelState.guild.id)
            .then(userIsSpamming => {
              if (!userIsSpamming) {
                systemChannel.send({ embeds })
              }
            })
            .catch(error => {
              Logger.error(error)
              systemChannel.send({ embeds })
            })

        })
    })
    .catch((error) => {
      Logger.error(error)
    })
}
export const voiceStateConsumer = (
  client: Client,
  voiceChannelOldState: VoiceState,
  voiceChannelNewState: VoiceState,
  spamFilterService: SpamFilterService,
  userProfileService : UserProfileService
) => {

  // the user could have been mute, deafen, and any other action
  const otherVoiceChannelAction: boolean = voiceChannelOldState.channel == voiceChannelNewState.channel

  if (otherVoiceChannelAction) {
    return
  }

  let voiceChannelState: VoiceState

  if (voiceChannelNewState.channel != null) {
    voiceChannelState = voiceChannelNewState
    consumeUserAction(client, voiceChannelNewState, UserAction.JOIN, spamFilterService, userProfileService)
  } else if (voiceChannelOldState.channel != null) {
    voiceChannelState = voiceChannelOldState
    consumeUserAction(client, voiceChannelOldState, UserAction.LEAVE, spamFilterService, userProfileService)
  }

  client.emit("voiceStateComplete", voiceChannelState.id, voiceChannelState.guild.id)
}
