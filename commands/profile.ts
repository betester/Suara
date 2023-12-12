import { APIInteractionGuildMember, CacheType, Client, CommandInteraction, EmbedBuilder, GuildMember } from "discord.js";
import { Command } from "./command";
import { UserProfileService } from "../service";
import jsLogger, { ILogger } from "js-logger"
import { Color, UserAction } from "../enums";
import { UserProfile } from "../models";

jsLogger.useDefaults()

const Logger: ILogger = jsLogger.get("profileCommand")

export class ProfileCommand implements Command {

  private userProfileService: UserProfileService
  private static HOUR_MILLISECOND = 3_600_000

  constructor(userProfile: UserProfileService) {
    this.userProfileService = userProfile
  }

  public execute(interaction: CommandInteraction<CacheType>) {

    const member : GuildMember | APIInteractionGuildMember = interaction.member
    let userInVoiceChannel : boolean = false

    if (member instanceof GuildMember) {
      userInVoiceChannel = member.voice.channel != null
    }

    this.userProfileService
      .get(interaction.user.id)
      .then(userProfile => {

        const { totalTimeSpent, lastTimeJoined } = userProfile
        const { username, accentColor } = interaction.user
        let newTotalTimeSpent = totalTimeSpent

        //TOOD:
        // this doesnt handle when the machine died and user leave and joins back again
        // the only way is probably somehow get the time that the machine went down
        // and then check if the lastTimeJoined less than the time it dies
        // if it does, then don't do any update on total time spent just update last time join
        if (userInVoiceChannel) {
          const currentTime = Date.now()
          newTotalTimeSpent += currentTime - lastTimeJoined
          const updatedUserProfile : UserProfile = {
            username : username,
            lastTimeJoined : currentTime, 
            totalTimeSpent : newTotalTimeSpent,
            lastUserAction : UserAction.JOIN
          }
          this.userProfileService.save(updatedUserProfile)
        }

        const userProfileEmbed = new EmbedBuilder()

        userProfileEmbed.setThumbnail(interaction.user.avatarURL())
        userProfileEmbed.setAuthor({
          name: username
        })
        userProfileEmbed.setColor(accentColor ?? Color.BLUE)
        userProfileEmbed.setTitle(`Spends ${this.toHour(newTotalTimeSpent)} in Voice Chat`)

        interaction.reply({ embeds: [userProfileEmbed] })
      })
      .catch(error => {
        Logger.error(error)
      })
  }

  private toHour(time: number): string {
    const numericHour = (time / ProfileCommand.HOUR_MILLISECOND)
    let hourString = "Hour" + (numericHour > 1 ? "s" : "")
    return `${numericHour.toFixed(2)} ${hourString}`
  }

}
