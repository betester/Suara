import { User } from "../models";
import { UserDataService, UserDataServiceGetManyArgs } from "./userDataService";
import { Collection, MongoClient } from "mongodb";
import jsLogger, { ILogger } from "js-logger";

jsLogger.useDefaults();

const Logger: ILogger = jsLogger.get("mongoUserDataServiceImpl");

export class MongoUserDataServiceImpl<T extends User>
  implements UserDataService<T>
{
  private userCollection: Collection<Document>;

  constructor(
    mongoClient: MongoClient,
    dbName: string,
    collectionName: string,
  ) {
    const db = mongoClient.db(dbName);
    this.userCollection = db.collection(collectionName);
    this.userCollection.createIndex({ username: 1 }, { background: true });
    this.userCollection.createIndex(
      { lastUserAction: 1 },
      { background: true },
    );
    this.userCollection.createIndex(
      { totalTimeSpent: -1 },
      { background: true },
    );
  }

  getMany(args: UserDataServiceGetManyArgs): Promise<T[]> {
    return this.userCollection
      .find(args.filter ?? {})
      .limit(args.limit ?? 0)
      .sort(args.sortBy ?? {})
      .toArray() as unknown as Promise<T[]>;
  }

  public save(key: string, user: T) {
    const filter = { username: key };
    const update = { $set: { ...user } };

    this.userCollection
      .updateOne(filter, update, { upsert: true })
      .catch((error) => {
        Logger.error(error);
      });
  }
  public get(key: string): Promise<T | null> {
    return this.userCollection.findOne({
      username: key,
    }) as unknown as Promise<T>;
  }
}
