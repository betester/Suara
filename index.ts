import { Client, ClientOptions, GatewayIntentBits, VoiceState } from "discord.js"
import jsLogger from "js-logger"
import { voiceStateConsumer, consumeVoiceStateComplete } from "./consumer"
import {  LocalStorage, MemoryCache, SpamFilterService, SpamFilterServiceImpl, UserDataService, UserDataServiceImpl } from "./service"
import { MemoryStorage } from "node-ts-cache-storage-memory"
import { User } from "./models"

const main = () => {
  jsLogger.useDefaults()

  const Logger = jsLogger.get("main")
  const TOKEN = process.env.DISCORD_BOT_TOKEN
  const SPAM_THRESHOLD = 5
  const TTL_SECONDS = 10

  const memoryCache: MemoryStorage = new MemoryStorage()
  const cache: LocalStorage<User> = new MemoryCache<User>(memoryCache)
  const userDataService : UserDataService = new UserDataServiceImpl(cache, TTL_SECONDS) 
  const spamFilterService : SpamFilterService = new SpamFilterServiceImpl(userDataService, SPAM_THRESHOLD)

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
    client.on("voiceStateUpdate", (oldVoiceChannelState: VoiceState, newVoiceChannelState: VoiceState) => {
      voiceStateConsumer(client, oldVoiceChannelState, newVoiceChannelState, spamFilterService)
    })
    client.on("voiceStateComplete", (userId: string, guildId : string) => {
      consumeVoiceStateComplete(userId, guildId, userDataService)
    })
  })


  client.login(TOKEN)
}

main()
