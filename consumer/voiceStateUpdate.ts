import { Client, TextChannel, VoiceState, VoiceChannel, EmbedBuilder, EmbedAuthorOptions } from "discord.js";
import { UserAction } from "../enums";
import jsLogger from 'js-logger'
import { voiceChhannelEmbeds } from "../client/embeds";

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
          const embeds: EmbedBuilder[] = [voiceChhannelEmbeds(action, description, author)]
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

  if (voiceChannelNewState.channel != null) {
    consumeUserAction(client, voiceChannelNewState, UserAction.JOIN)
  } else if (voiceChannelOldState.channel != null) {
    consumeUserAction(client, voiceChannelOldState, UserAction.LEAVE)
  }
}
