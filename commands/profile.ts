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
          `${username} Spends ${this.parseTime(
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

  // convert time to days, hours, minutes and seconds.
  private parseTime(time: number): string {
    const days = Math.floor(time / (24 * 60 * 60 * 1000));
    const daysms = time % (24 * 60 * 60 * 1000);
    const hours = Math.floor(daysms / (60 * 60 * 1000));
    const hoursms = daysms % (60 * 60 * 1000);
    const minutes = Math.floor(hoursms / (60 * 1000));
    const minutesms = hoursms % (60 * 1000);
    const sec = Math.floor(minutesms / 1000);

    const timeArray = [];
    if (days > 0) {
      timeArray.push(days + " days");
    }
    if (hours > 0) {
      timeArray.push(hours + " hours");
    }
    if (minutes > 0) {
      timeArray.push(minutes + " minutes");
    }
    if (sec > 0 || time === 0) {
      timeArray.push(sec + " seconds");
    }

    return timeArray.join(" ");
  }
}
