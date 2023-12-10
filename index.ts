import { Client, ClientOptions, GatewayIntentBits, VoiceState } from "discord.js"
import jsLogger from "js-logger"
import { voiceStateConsumer } from "./consumer"
import {  MemoryCache } from "./service"
import { MemoryStorage } from "node-ts-cache-storage-memory"

const main = () => {
  jsLogger.useDefaults()

  const LOGGER = jsLogger.get("main")
  const TOKEN = process.env.DISCORD_BOT_TOKEN

  const memoryCache: MemoryStorage = new MemoryStorage()
  const cache: MemoryCache<string> = new MemoryCache<string>(memoryCache)

  LOGGER.info("Configuring discord bot...")

  const clientOptions: ClientOptions = {
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.MessageContent
    ]
  }
  const client: Client = new Client(clientOptions)

  client.on("ready", () => {
    LOGGER.info("Bot is ready 🚀")
    client.on("voiceStateUpdate", (oldVoiceChannelState: VoiceState, newVoiceChannelState: VoiceState) => {
      voiceStateConsumer(client, oldVoiceChannelState, newVoiceChannelState)
    })
    client.on("voiceStateComplete", (userId: string) => {
      LOGGER.debug(userId)
    })
  })


  client.login(TOKEN)
}

main()
