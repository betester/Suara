import { CacheType, CommandInteraction } from "discord.js";

export interface Command {
  execute : (interaction : CommandInteraction<CacheType>) => void
}
