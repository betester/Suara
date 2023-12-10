import { ColorResolvable, EmbedAuthorOptions, EmbedBuilder } from "discord.js";
import { Color, UserAction } from "../../enums";

const USER_ACTION_COLOR: Map<UserAction, Color> = new Map<UserAction, Color>()

USER_ACTION_COLOR.set(UserAction.JOIN, Color.BLUE)
USER_ACTION_COLOR.set(UserAction.LEAVE, Color.RED)

export const voiceChannelEmbeds = (action: UserAction, description: string, author: EmbedAuthorOptions) => {
  const embed: EmbedBuilder = new EmbedBuilder()
  const color :ColorResolvable = USER_ACTION_COLOR.get(action)
  embed
    .setColor(color)
    .setAuthor(author)
    .setDescription(description)
  
  return embed
}
