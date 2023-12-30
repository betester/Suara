import {
  CommandInteraction,
  CacheType,
  EmbedBuilder,
  Client,
  User,
  APIEmbedField,
} from "discord.js";
import { Command } from "./command";
import { UserProfileService } from "../service";
import jsLogger, { ILogger } from "js-logger";
import utils from "../utils";

jsLogger.useDefaults();

const Logger: ILogger = jsLogger.get("leaderboardCommand");
const MAX_LIMIT = 10;

export class LeaderboardCommand implements Command {
  private userProfileService: UserProfileService;

  constructor(userProfileService: UserProfileService) {
    this.userProfileService = userProfileService;
  }

  public async execute(interaction: CommandInteraction<CacheType>) {
    try {
      const userProfiles = await this.userProfileService.leaderboard(MAX_LIMIT);
      const users = await this.getUsers(
        interaction.client,
        userProfiles.map((userProfile) => userProfile.username),
      );

      const leaderboardEmbed = new EmbedBuilder();

      if (users.length == 0) {
        leaderboardEmbed.setTitle("Number 1 is 🐪");
        leaderboardEmbed.setDescription(
          "It seems no one has joined any voice channel yet...",
        );
      } else {
        const numberOneUser = users[0];
        leaderboardEmbed.setTitle(`Number 1 is ${numberOneUser.username}`);
        leaderboardEmbed.setDescription(
          `With time spent: ${utils.parseTime(userProfiles[0].totalTimeSpent)}`,
        );
        leaderboardEmbed.setThumbnail(numberOneUser.avatarURL());

        // removes the first user
        let otherUsers = "";

        for (let i = 1; i < users.length; i++) {
          otherUsers += `${i + 1}. ${users[i]} - ${utils.parseTime(
            userProfiles[i].totalTimeSpent,
          )}`;
        }

        const otherUserRankField: APIEmbedField = {
          name: "User Ranks",
          value: otherUsers,
        };

        leaderboardEmbed.addFields(otherUserRankField);

        interaction.reply({
          embeds: [leaderboardEmbed],
        });
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  private async getUsers(client: Client, userIds: string[]): Promise<User[]> {
    return Promise.all(userIds.map((userId) => client.users.fetch(userId)));
  }
}
