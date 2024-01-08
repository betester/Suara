import { CommandInteraction, CacheType, EmbedBuilder } from "discord.js";
import { Command } from "./command";
import { UserProfileService, TimeTogetherSpentService } from "../service";
import jsLogger, { ILogger } from "js-logger";
import { UserProfile } from "../models";

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
            currentlyJoiningUser.splice(i + 1),
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
        const topNusers = this.userProfileService.leaderboard(
          10,
          interaction.guildId,
        );
        const leaderboardEmbed = new EmbedBuilder();
        //TODO: continue showing the embed
      });
    } catch (error) {
      Logger.error(error);
    }
  }
}
