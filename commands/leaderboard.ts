import { CommandInteraction, CacheType, EmbedBuilder } from "discord.js";
import { Command } from "./command";
import { UserProfileService, TimeTogetherSpentService } from "../service";
import jsLogger, { ILogger } from "js-logger";
import { UserProfile } from "../models";
import utils from "../utils";
import { calculateTimeTakenOnMethod } from "../monitor";

jsLogger.useDefaults();

const Logger: ILogger = jsLogger.get("leaderboardCommand");

export class LeaderboardCommand implements Command {
  private userProfileService: UserProfileService;
  private timeTogetherSpentService: TimeTogetherSpentService;

  constructor(
    userProfileService: UserProfileService,
    timeTogetherSpentService: TimeTogetherSpentService,
  ) {
    this.userProfileService = userProfileService;
    this.timeTogetherSpentService = timeTogetherSpentService;
  }

  @calculateTimeTakenOnMethod
  public async execute(interaction: CommandInteraction<CacheType>) {
    try {
      // get all user that joins the voice channel
      // at some point probably gonna need some rate limiter, this can be really slow if
      // abused
      const currentlyJoiningUser =
        await this.userProfileService.getCurrentUserInVoiceChannel(
          interaction.guildId,
        );
      // this steps is needed because if not, then the time of current user is updated
      // and it won't be consistent for the next time user calling profile
      for (let i = 0; i < currentlyJoiningUser.length; i++) {
        for (let j = i + 1; j < currentlyJoiningUser.length; j++) {
          this.timeTogetherSpentService.updateTimeSpentWith(
            currentlyJoiningUser[i],
            currentlyJoiningUser.slice(i + 1),
          );
        }
      }

      // if there are any user joining then it's necessary to update to newest
      // condition for consistency
      const savePromises: Promise<UserProfile>[] = [];
      for (let i = 0; i < currentlyJoiningUser.length; i++) {
        savePromises.push(
          this.userProfileService.saveByUserAction(
            currentlyJoiningUser[i].username,
            interaction.guildId,
            currentlyJoiningUser[i].lastUserAction,
          ),
        );
      }
      // return top N from the leaderboard
      Promise.all(savePromises).then(async (_) => {
        const topNusers = await this.userProfileService.leaderboard(
          10,
          interaction.guildId,
        );
        this.sendLeaderboardEmbeds(topNusers, interaction);
      });
    } catch (error) {
      Logger.error(error);
    }
  }

  private async sendLeaderboardEmbeds(
    topNUsers: UserProfile[],
    interaction: CommandInteraction<CacheType>,
  ) {
    const client = interaction.client;
    const currentUsers = await Promise.all(
      topNUsers.map((user) => client.users.fetch(user.username)),
    );
    if (currentUsers.length > 0) {
      const numberOneUser = currentUsers[0];
      const leaderboardEmbed = new EmbedBuilder();

      leaderboardEmbed.setAuthor({
        name: "Leaderboard",
      });

      leaderboardEmbed.setTitle(`Number 1 is ${numberOneUser.username}`);
      leaderboardEmbed.setDescription(
        `With time spent ${utils.parseTime(topNUsers[0].totalTimeSpent)}`,
      );
      leaderboardEmbed.setThumbnail(numberOneUser.avatarURL());

      let otherUserDefaultValue = "";

      for (let i = 1; i < currentUsers.length; i++) {
        otherUserDefaultValue += `${i + 1}. ${
          currentUsers[i].username
        } - ${utils.parseTime(topNUsers[i].totalTimeSpent)}\n`;
      }

      if (!otherUserDefaultValue) {
        otherUserDefaultValue = "No other user has join yet... 🐪";
      }

      leaderboardEmbed.addFields({
        name: "Other Users",
        value: otherUserDefaultValue,
      });

      interaction.reply({
        embeds: [leaderboardEmbed],
      });
    }
  }
}
