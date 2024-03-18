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
        await this.updateTimeSpentWith(interaction.guildId, userVoiceChannel, userProfile);
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
      await this.addTopTimeSpentTogether(interaction.guildId, userProfileEmbed, id, 3);
      interaction.reply({
        embeds: [userProfileEmbed],
      });
    }
  }

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
    guildId: string,
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
        guildId,
        user,
        userProfiles,
      );
    } catch (error) {
      Logger.error(error);
    }
  }

  private async addTopTimeSpentTogether(
    guildId: string, 
    embed: EmbedBuilder,
    username: string,
    n: number,
  ) {
    try {
      const topNUser = await this.timeTogetherSpentService.get(guildId, username, n);
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
  }
}
