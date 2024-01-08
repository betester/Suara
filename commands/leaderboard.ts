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

  public async execute(interaction: CommandInteraction<CacheType>) {}
}