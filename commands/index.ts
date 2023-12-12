
export { Command } from './command'
export * from './profile'

export type CommandName = "profile" 

interface CommandDescription {
  name : CommandName 
  description : string 
}

export const commands : CommandDescription[] = [
  {
    name : "profile",
    description : "Shows how much time have you spent on voice chat!"
  }
]
