import { MongoClient } from "mongodb";
import { MongoTimeTogetherSpentImpl, TimeTogetherSpentDataService } from ".";
import { TimeTogetherSpent } from "../models";

export class TimeTogetherSpentDataServiceFactory {
  private collections: Map<string, TimeTogetherSpentDataService<any>>;
  private client: MongoClient;
  private dbName: string;
  private collectionPrefix: string;

  constructor(client: MongoClient, dbName: string, collectionPrefix: string) {
    this.collections = new Map<string, any>();
    this.dbName = dbName;
    this.collectionPrefix = collectionPrefix;
    this.client = client;
  }

  get<T extends TimeTogetherSpent>(guildId: string): TimeTogetherSpentDataService<T> {
    if (!this.collections.has(guildId)) {
      const newCollection = new MongoTimeTogetherSpentImpl(
        this.client,
        this.dbName,
        `${this.collectionPrefix}:${guildId}`,
      );
      this.collections.set(guildId, newCollection);
    }
    return this.collections.get(guildId) as TimeTogetherSpentDataService<T>;
  }
}
