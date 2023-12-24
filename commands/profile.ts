import {
  CacheType,
  CommandInteraction,
  EmbedBuilder,
  Guild,
  User,
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

  constructor(userProfile: UserProfileService) {
    this.userProfileService = userProfile;
  }

  public async execute(interaction: CommandInteraction<CacheType>) {
    const userProfileEmbed = new EmbedBuilder();
    const user = await this.getUser(interaction)
    const { username, accentColor, id } = user
    const userInVoiceChannel = await this.isUserInVoiceChannel(interaction.guild, id)

    userProfileEmbed.setThumbnail(user.avatarURL());
    userProfileEmbed.setAuthor({
      name: username,
    });
    userProfileEmbed.setColor(accentColor ?? Color.BLUE);

    try {
      const userProfile = await this.userProfileService.get(id)

      if (userProfile != null) {
        const { totalTimeSpent, lastTimeJoined } = userProfile;
        let newTotalTimeSpent = totalTimeSpent;
        const lastUpTime = interaction.client.readyAt;

        if (userInVoiceChannel) {
          const currentTime = Date.now();

          if (lastUpTime.getMilliseconds() < lastTimeJoined) {
            newTotalTimeSpent += currentTime - lastTimeJoined;
          }

          const updatedUserProfile: UserProfile = {
            username: id,
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
      } else if (userInVoiceChannel) {
          const currentTime = Date.now();

          const updatedUserProfile: UserProfile = {
            username: id,
            lastTimeJoined: currentTime,
            totalTimeSpent: 0,
            lastUserAction: UserAction.JOIN,
          };
          this.userProfileService.save(updatedUserProfile);

        userProfileEmbed.setTitle(
          `${username} Spends ${this.parseTime(
            0,
          )} in Voice Channel`,
        );
      } else {
        userProfileEmbed.setTitle(
          `${username} Has not Join Any Voice Channel Yet..`,
        );
      }
    }
    catch (error) {
      Logger.error(error);

    } finally {
      interaction.reply({
        embeds: [userProfileEmbed]
      })
    }
  }

  private async getUser(interaction: CommandInteraction<CacheType>): Promise<User> {
    const userId = interaction.options.get("user")

    if (userId == null) {
      return new Promise<User>((resolve, _) => {
        resolve(interaction.user)
      })
    }

    return interaction.client.users.fetch(userId.value as string)
  }

  private async isUserInVoiceChannel(guild: Guild, userId: string): Promise<boolean> {
    const member = await guild.members.fetch(userId)
    return new Promise((resolve, reject) => {
      try {
        resolve(member.voice.channel != null)
      } catch (_) {
        reject(false)
      }
    })

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
      timeArray.push(days + " Days");
    }
    if (hours > 0) {
      timeArray.push(hours + " Hours");
    }
    if (minutes > 0) {
      timeArray.push(minutes + " Minutes");
    }
    if (sec > 0 || time === 0) {
      timeArray.push(sec + " Seconds");
    }

    return timeArray.join(" ");
  }

}
