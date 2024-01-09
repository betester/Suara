import { ApplicationCommandOptionType } from "discord.js";

export { Command } from "./command";
export * from "./profile";
export * from "./bot";
export * from "./leaderboard";

export type CommandName = "profile" | "bot" | "leaderboard";

interface Choice {
  name: string;
  value: any;
}

interface CommandOption {
  name: string;
  description: string;
  type: ApplicationCommandOptionType;
  choices?: Choice[];
  required: boolean;
}

interface CommandDescription {
  name: CommandName;
  description: string;
  options?: CommandOption[];
}

const devCommands: CommandDescription[] = [
  {
    name: "bot",
    description: "Action that will be taken by the bot",
    options: [
      {
        name: "vc",
        description: "Voice Channel Action",
        type: ApplicationCommandOptionType.String,
        choices: [
          {
            name: "join",
            value: "join",
          },
          {
            name: "leave",
            value: "leave",
          },
        ],
        required: true,
      },
    ],
  },
];
export const commands: CommandDescription[] = [
  {
    name: "profile",
    description: "Shows how much time have you spent on voice chat!",
    options: [
      {
        name: "user",
        description: "Select user",
        type: ApplicationCommandOptionType.User,
        required: false,
      },
    ],
  },
  {
    name: "leaderboard",
    description: "Shows top 10 users who spent their time on voice channel",
  },
  ...(process.env.ENVIRONMENT === "dev" ? devCommands : []),
];
