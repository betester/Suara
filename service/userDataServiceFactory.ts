import { MongoClient } from "mongodb";
import { MongoUserDataServiceImpl, UserDataService } from ".";
import { User } from "../models";

export class UserDataServiceFactory {
  private collections: Map<string, UserDataService<any>>;
  private client: MongoClient;
  private dbName: string;
  private collectionPrefix: string;

  constructor(client: MongoClient, dbName: string, collectionPrefix: string) {
    this.collections = new Map<string, any>();
    this.dbName = dbName;
    this.collectionPrefix = collectionPrefix;
    this.client = client;
  }

  get<T extends User>(guildId: string): UserDataService<T> {
    if (!this.collections.has(guildId)) {
      const newCollection = new MongoUserDataServiceImpl(
        this.client, 
        this.dbName, 
        `${this.collectionPrefix}:{guildId}`
      );
      this.collections.set("guildId", newCollection);
    }
    return this.collections.get(guildId) as UserDataService<T>;
  }
}
