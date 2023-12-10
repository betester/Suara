import { Client, TextChannel, VoiceState, VoiceChannel, EmbedBuilder, EmbedAuthorOptions } from "discord.js";
import { UserAction } from "../enums";
import jsLogger from 'js-logger'
import { voiceChannelEmbeds } from "../client/embeds";
import { SpamFilterService } from "../service";

jsLogger.useDefaults()
const LOGGER = jsLogger.get("voiceChannelConsumer")

const consumeUserAction = (
  client: Client,
  voiceChannelState: VoiceState,
  action: UserAction,
  spamFilterSerivice: SpamFilterService
) => {

  const systemChannel: TextChannel = voiceChannelState.guild.systemChannel

  client.users
    .fetch(voiceChannelState.id)
    .then((user) => {
      client.channels
        .fetch(voiceChannelState.channelId)
        .then((channel: VoiceChannel) => {
          const description: string = `${action} ${channel.name} voice chat`
          const author: EmbedAuthorOptions = {
            iconURL: user.avatarURL(),
            name: user.username
          }
          spamFilterSerivice
            .isSpamming(user.id, voiceChannelState.guild.id)
            .then(userIsSpamming => {
              if (!userIsSpamming) {
                const embeds: EmbedBuilder[] = [voiceChannelEmbeds(action, description, author)]
                systemChannel.send({ embeds })
              }
            })
            .catch(error => {
              LOGGER.error(error)
            })

        })
    })
    .catch((error) => {
      LOGGER.error(error)
    })
}
export const voiceStateConsumer = (
  client: Client, 
  voiceChannelOldState: VoiceState, 
  voiceChannelNewState: VoiceState,
  spamFilterService : SpamFilterService
) => {

  // the user could have been mute, deafen, and any other action
  const otherVoiceChannelAction: boolean = voiceChannelOldState.channel == voiceChannelNewState.channel

  if (otherVoiceChannelAction) {
    return
  }

  let voiceChannelState: VoiceState

  if (voiceChannelNewState.channel != null) {
    voiceChannelState = voiceChannelNewState
    consumeUserAction(client, voiceChannelNewState, UserAction.JOIN, spamFilterService)
  } else if (voiceChannelOldState.channel != null) {
    voiceChannelState = voiceChannelOldState
    consumeUserAction(client, voiceChannelOldState, UserAction.LEAVE, spamFilterService)
  }

  client.emit("voiceStateComplete", voiceChannelState.id, voiceChannelState.guild.id)
}
