export interface SpamFilterService {
  isSpamming: (userId: string, guildId: string) => Promise<boolean>;
  countUserJoinOccurence: (userId: string, guildId: string) => void;
}
