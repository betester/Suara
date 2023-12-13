import {
  APIInteractionGuildMember,
  CacheType,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
} from "discord.js";
import { Command } from "./command";
import { UserProfileService } from "../service";
import jsLogger, { ILogger } from "js-logger";
import { Color, UserAction } from "../enums";
import { UserProfile } from "../models";

jsLogger.useDefaults();

const Logger: ILogger = jsLogger.get("profileCommand");

export class ProfileCommand implements Command {
  private userProfileService: UserProfileService;
  private static HOUR_MILLISECOND = 3_600_000;

  constructor(userProfile: UserProfileService) {
    this.userProfileService = userProfile;
  }

  public execute(interaction: CommandInteraction<CacheType>) {
    const member: GuildMember | APIInteractionGuildMember = interaction.member;
    let userInVoiceChannel: boolean = false;

    if (member instanceof GuildMember) {
      userInVoiceChannel = member.voice.channel != null;
    }

    const { username, accentColor } = interaction.user;
    const userProfileEmbed = new EmbedBuilder();

    userProfileEmbed.setThumbnail(interaction.user.avatarURL());
    userProfileEmbed.setAuthor({
      name: username,
    });
    userProfileEmbed.setColor(accentColor ?? Color.BLUE);

    this.userProfileService
      .get(interaction.user.id)
      .then((userProfile) => {
        const { totalTimeSpent, lastTimeJoined } = userProfile;
        let newTotalTimeSpent = totalTimeSpent;
        const lastUpTime = interaction.client.readyAt;

        if (userInVoiceChannel) {
          const currentTime = Date.now();

          if (lastUpTime.getMilliseconds() < lastTimeJoined) {
            newTotalTimeSpent += currentTime - lastTimeJoined;
          }

          const updatedUserProfile: UserProfile = {
            username: interaction.user.id,
            lastTimeJoined: currentTime,
            totalTimeSpent: newTotalTimeSpent,
            lastUserAction: UserAction.JOIN,
          };
          this.userProfileService.save(updatedUserProfile);
        }

        userProfileEmbed.setTitle(
          `${username} Spends ${this.toHour(
            newTotalTimeSpent,
          )} in Voice Channel`,
        );
      })
      .catch((error) => {
        Logger.error(error);
        userProfileEmbed.setTitle(
          `${username} Has not Join Any Voice Channel Yet..`,
        );
      })
      .finally(() => {
        interaction.reply({ embeds: [userProfileEmbed] });
      });
  }

  private toHour(time: number): string {
    const numericHour = time / ProfileCommand.HOUR_MILLISECOND;
    let hourString = "Hour" + (numericHour > 1 ? "s" : "");
    return `${numericHour.toFixed(2)} ${hourString}`;
  }
}
