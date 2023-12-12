import { Client, ClientOptions, GatewayIntentBits, REST, Routes, VoiceState } from "discord.js"
import jsLogger from "js-logger"
import { voiceStateConsumer, consumeVoiceStateComplete } from "./consumer"
import {
  LocalStorage,
  MemoryCache,
  SpamFilterService,
  SpamFilterServiceImpl,
  UserDataService,
  UserDataServiceImpl,
  UserProfileService,
  UserProfileServiceImpl
} from "./service"
import { MemoryStorage } from "node-ts-cache-storage-memory"
import { UserProfile, UserSpam } from "./models"
import { MongoClient } from "mongodb"
import { MongoUserDataServiceImpl } from "./service/mongoUserDataServiceImpl"
import { Command, CommandName, ProfileCommand, commands } from "./commands"

const main = () => {
  jsLogger.useDefaults()

  const Logger = jsLogger.get("main")

  const TOKEN = process.env.DISCORD_BOT_TOKEN
  const CLIENT_ID = process.env.DISCORD_CLIENT_ID

  const SPAM_THRESHOLD = 5
  const TTL_SECONDS = 10

  const MONGO_URL = process.env.MONGO_URL
  const MONGO_DATABASE_NAME = "Suara"
  const MONGO_USER_PROFILE_COLLECTION_NAME = "UserProfile"

  const memoryCache: MemoryStorage = new MemoryStorage()
  const cache: LocalStorage<UserSpam> = new MemoryCache<UserSpam>(memoryCache)
  const mongoClient: MongoClient = new MongoClient(MONGO_URL)

  const userProfileDataService: UserDataService<UserProfile> = new MongoUserDataServiceImpl(
    mongoClient,
    MONGO_DATABASE_NAME,
    MONGO_USER_PROFILE_COLLECTION_NAME
  )
  const userDataService: UserDataService<UserSpam> = new UserDataServiceImpl(cache, TTL_SECONDS)

  const spamFilterService: SpamFilterService = new SpamFilterServiceImpl(userDataService, SPAM_THRESHOLD)
  const userProfileService: UserProfileService = new UserProfileServiceImpl(userProfileDataService)
  
  const profileCommand : Command = new ProfileCommand(userProfileService)
  
  const commandMap : Map<CommandName, Command> = new Map< CommandName, Command>() 
  commandMap.set("profile", profileCommand)

  Logger.info("Configuring discord bot...")

  const clientOptions: ClientOptions = {
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.MessageContent
    ]
  }

  const client: Client = new Client(clientOptions)

  client.on("ready", () => {
    Logger.info("Bot is ready 🚀")
  })

  client.on("voiceStateUpdate", (oldVoiceChannelState: VoiceState, newVoiceChannelState: VoiceState) => {
    voiceStateConsumer(client, oldVoiceChannelState, newVoiceChannelState, spamFilterService)
  })
  client.on("voiceStateComplete", (userId: string, guildId: string) => {
    consumeVoiceStateComplete(userId, guildId, spamFilterService, userProfileService)
  })
  client.on("interactionCreate", interaction => {
    if (interaction.isCommand()) {
      commandMap.get(interaction.commandName as CommandName).execute(interaction)
    }
  })

  client.login(TOKEN)

  Logger.info("Configuring commands...")

  const rest: REST = new REST({ version: '10' }).setToken(TOKEN)
  rest
    .put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    )
    .then( _ => {
      Logger.info("Commands are set 🫡, here are the following commands")
      commands.forEach(command => {
        Logger.info(command)
      })
    })
    .catch(error => {
      Logger.error(error)
    })
}

main()
