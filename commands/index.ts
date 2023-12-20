import { ApplicationCommandOptionType } from "discord.js";

export { Command } from "./command";
export * from "./profile";

export type CommandName = "profile";

interface CommandOption {
  name: string;
  description: string;
  type: ApplicationCommandOptionType;
  required: boolean;
}

interface CommandDescription {
  name: CommandName;
  description: string;
  options? : CommandOption[]
}

export const commands: CommandDescription[] = [
  {
    name: "profile",
    description: "Shows how much time have you spent on voice chat!",
    options: [
      {
        name: "user",
        description: "Select user",
        type: ApplicationCommandOptionType.User,
        required: false
      }
    ]
  },
];
