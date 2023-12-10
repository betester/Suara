import { Client, TextChannel, VoiceState, VoiceChannel, EmbedBuilder, EmbedAuthorOptions } from "discord.js";
import { UserAction } from "../enums";
import jsLogger from 'js-logger'
import { voiceChannelEmbeds } from "../client/embeds";

jsLogger.useDefaults()
const LOGGER = jsLogger.get("voiceChannelConsumer")

const consumeUserAction = (client: Client, voiceChannelState: VoiceState, action: UserAction) => {

  const systemChannel: TextChannel = voiceChannelState.guild.systemChannel

  client.users
    .fetch(voiceChannelState.id)
    .then((user) => {
      client.channels
        .fetch(voiceChannelState.channelId)
        .then((channel: VoiceChannel) => {
          const description: string = `${user.username} ${action} ${channel.name} voice chat`
          const author: EmbedAuthorOptions = {
            iconURL: user.avatarURL(),
            name: user.username
          }
          const embeds: EmbedBuilder[] = [voiceChannelEmbeds(action, description, author)]
          systemChannel.send({ embeds })
        })
    })
    .catch((error) => {
      LOGGER.error(error)
    })
}
export const voiceStateConsumer = (client: Client, voiceChannelOldState: VoiceState, voiceChannelNewState: VoiceState) => {

  // the user could have been mute, deafen, and any other action
  const otherVoiceChannelAction: boolean = voiceChannelOldState.channel == voiceChannelNewState.channel

  if (otherVoiceChannelAction) {
    return
  }

  let voiceChannelState : VoiceState

  if (voiceChannelNewState.channel != null) {
    voiceChannelState = voiceChannelNewState
    consumeUserAction(client, voiceChannelNewState, UserAction.JOIN)
  } else if (voiceChannelOldState.channel != null) {
    voiceChannelState = voiceChannelOldState
    consumeUserAction(client, voiceChannelOldState, UserAction.LEAVE)
  }

  client.emit("voiceStateComplete", voiceChannelState.id)
}
