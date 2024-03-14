import {
  APIEmbedField,
  CacheType,
  Client,
  CommandInteraction,
  EmbedBuilder,
  Guild,
  User,
  VoiceBasedChannel,
} from "discord.js";
import { Command } from "./command";
import { TimeTogetherSpentService, UserProfileService } from "../service";
import jsLogger, { ILogger } from "js-logger";
import { Color, UserAction } from "../enums";
import { UserProfile } from "../models";
import utils from "../utils";
import { calculateTimeTakenOnMethod } from "../monitor";

jsLogger.useDefaults();

const Logger: ILogger = jsLogger.get("profileCommand");

export class ProfileCommand implements Command {
  private userProfileService: UserProfileService;
  private timeTogetherSpentService: TimeTogetherSpentService;
  private client: Client;

  constructor(
    userProfile: UserProfileService,
    timeTogetherSpentService: TimeTogetherSpentService,
    client: Client,
  ) {
    this.userProfileService = userProfile;
    this.timeTogetherSpentService = timeTogetherSpentService;
    this.client = client;
  }

  @calculateTimeTakenOnMethod
  public async execute(interaction: CommandInteraction<CacheType>) {
    const userProfileEmbed = new EmbedBuilder();
    const user = await this.getUser(interaction);
    const { username, accentColor, id } = user;
    const userVoiceChannel = await this.getUserVoiceChannel(
      interaction.guild,
      id,
    );
    const userInVoiceChannel = userVoiceChannel != null;

    userProfileEmbed.setThumbnail(user.avatarURL());
    userProfileEmbed.setAuthor({
      name: username,
    });
    userProfileEmbed.setColor(accentColor ?? Color.BLUE);

    try {
      const userProfile = await this.userProfileService.get(
        id,
        interaction.guild.id,
      );

      const lastUserAction = userInVoiceChannel
        ? UserAction.JOIN
        : UserAction.LEAVE;

      if (userProfile != null) {
        await this.updateTimeSpentWith(userVoiceChannel, userProfile);
      }

      const newUserProfile = await this.userProfileService.saveByUserAction(
        id,
        interaction.guildId,
        lastUserAction,
      );

      userProfileEmbed.addFields({
        name: "Voice Channel Time Spent",
        value: utils.parseTime(newUserProfile.totalTimeSpent),
      });
    } catch (error) {
      Logger.error(error);
    } finally {
      await this.addTopTimeSpentTogether(userProfileEmbed, id, 3);
      interaction.reply({
        embeds: [userProfileEmbed],
      });
    }
  }

<<<<<<< Updated upstream
  private async getUser(
    interaction: CommandInteraction<CacheType>,
  ): Promise<User> {
    const userId = interaction.options.get("user");

    if (userId == null) {
      return new Promise<User>((resolve, _) => {
        resolve(interaction.user);
      });
    }

    return interaction.client.users.fetch(userId.value as string);
  }

  private async getUserVoiceChannel(
    guild: Guild,
    userId: string,
  ): Promise<VoiceBasedChannel> {
    const member = await guild.members.fetch(userId);
    return new Promise((resolve, reject) => {
      try {
        resolve(member.voice.channel);
      } catch (error) {
        reject(error);
      }
    });
  }

  private async updateTimeSpentWith(
    voiceChannel: VoiceBasedChannel,
    user: UserProfile,
  ) {
    try {
      if (voiceChannel == null) {
        return;
      }

      const currentJoinMembers = voiceChannel.members.map(
        (member) => member.id,
      );
      currentJoinMembers.splice(currentJoinMembers.indexOf(user.username), 1);
      const userProfiles = await this.userProfileService.getMany(
        currentJoinMembers,
        voiceChannel.guild.id,
      );
      await this.timeTogetherSpentService.updateTimeSpentWith(
        user,
        userProfiles,
      );
    } catch (error) {
      Logger.error(error);
    }
  }

  private async addTopTimeSpentTogether(
    embed: EmbedBuilder,
    username: string,
    n: number,
  ) {
    try {
      const topNUser = await this.timeTogetherSpentService.get(username, n);
      const fields: APIEmbedField = {
        name: "Most Time Spent With",
        value: "Haven't spent time with anyone else... 🐪",
      };

      if (topNUser.length == 0) {
        embed.addFields(fields);
        return;
      }

      let newVal = "";
      const topNUserIds = topNUser.map((timeSpentWith) =>
        timeSpentWith.userA == username
          ? timeSpentWith.userB
          : timeSpentWith.userA,
      );
      const topUserProfiles = await Promise.all(
        topNUserIds.map((id) => {
          return this.client.users.fetch(id);
        }),
      );

      for (let i = 0; i < topUserProfiles.length; i++) {
        newVal += `${topUserProfiles[i].username} - ${utils.parseTime(
          topNUser[i].timeSpentTogether,
        )}\n`;
      }

      fields.value = newVal !== "" ? newVal : fields.value;

      embed.addFields(fields);
    } catch (error) {
      Logger.error(error);
    }
=======
  // convert time to days, hours, minutes and seconds.
  private parseTime(time: number): string {
    const years = Math.floor(time / (365 * 24 * 60 * 60 * 1000));
    const yearsms = time % (365 * 24 * 60 * 60 * 1000);
    const months = Math.floor(yearsms / (30 * 24 * 60 * 60 * 1000));
    const monthsms = yearsms % (30 * 24 * 60 * 60 * 1000);
    const weeks = Math.floor(monthsms / (7 * 24 * 60 * 60 * 1000));
    const weeksms = monthsms % (7 * 24 * 60 * 60 * 1000);
    const days = Math.floor(weeksms / (24 * 60 * 60 * 1000));
    const daysms = weeksms % (24 * 60 * 60 * 1000);
    const hours = Math.floor(daysms / (60 * 60 * 1000));
    const hoursms = daysms % (60 * 60 * 1000);
    const minutes = Math.floor(hoursms / (60 * 1000));
    const minutesms = hoursms % (60 * 1000);
    const sec = Math.floor(minutesms / 1000);

    const timeArray = [];
    if (years > 0) {
      timeArray.push(years + " Years");
    }
    if (months > 0) {
      timeArray.push(months + " Months");
    }
    if (weeks > 0) {
      timeArray.push(weeks + " Weeks");
    }
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

    return timeArray.slice(0, 3).join(" ");
>>>>>>> Stashed changes
  }
}
