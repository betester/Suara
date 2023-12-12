import { CacheType, CommandInteraction, EmbedBuilder, resolveColor } from "discord.js";
import { Command } from "./command";
import { UserProfileService } from "../service";
import jsLogger, { ILogger } from "js-logger"

jsLogger.useDefaults()

const Logger: ILogger = jsLogger.get("profileCommand")

export class ProfileCommand implements Command {

  private userProfileService: UserProfileService
  private static HOUR_MILLISECOND = 3_600_000

  constructor(userProfile: UserProfileService) {
    this.userProfileService = userProfile
  }

  public execute(interaction: CommandInteraction<CacheType>) {
    this.userProfileService
      .get(interaction.user.id)
      .then(userProfile => {
        const { totalTimeSpent } = userProfile
        const { username, avatarURL, accentColor } = interaction.user
        const userProfileEmbed = new EmbedBuilder()

        userProfileEmbed.setThumbnail(avatarURL())
        userProfileEmbed.setAuthor({
          name: username
        })
        userProfileEmbed.setColor(resolveColor(accentColor))
        userProfileEmbed.setTitle(`Spends ${this.toHour(totalTimeSpent)} in Voice Chat`)

        interaction.reply({ embeds: [userProfileEmbed] })
      })
      .catch(error => {
        Logger.error(error)
      })
  }

  private toHour(time : number) : string {
    const numericHour = (time/ProfileCommand.HOUR_MILLISECOND)
    let hourString = "Hour" + (numericHour > 1 ?  "s" : "")
    return `${numericHour.toFixed(2)} ${hourString}`
  }
}
