import { CommandInteraction, CacheType } from "discord.js";
import { Command } from "./command";
import { joinVoiceChannel, getVoiceConnection } from "@discordjs/voice";
import jsLogger from "js-logger";

jsLogger.useDefaults();

const Logger = jsLogger.get("botCommand");

export class BotCommand implements Command {
  public async execute(interaction: CommandInteraction<CacheType>) {
    try {
      const action = interaction.options.get("vc", true);
      const { id } = interaction.user;
      const member = await interaction.guild?.members.fetch(id);
      const channel = member?.voice.channel;

      if (action.value === "join" && channel && interaction.guild) {
        joinVoiceChannel({
          channelId: channel.id,
          guildId: interaction.guild.id,
          adapterCreator: interaction.guild.voiceAdapterCreator,
        });
      } else if (action.value === "leave" && interaction.guild) {
        getVoiceConnection(interaction.guild.id)?.disconnect();
      }
    } catch (error) {
      Logger.error(error);
    }
  }
}
