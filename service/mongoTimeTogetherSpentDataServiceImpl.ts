import { TimeTogetherSpentDataService } from ".";
import { TimeTogetherSpent } from "../models";
import { MongoClient, Collection, Document } from "mongodb";
import jsLogger from "js-logger";

jsLogger.useDefaults();

const Logger = jsLogger.get("mongoTimeTogetherSpentImpl");

export class MongoTimeTogetherSpentImpl<T extends TimeTogetherSpent>
  implements TimeTogetherSpentDataService<T>
{
  private timeTogetherSpentCollection: Collection<Document>;

  constructor(
    mongoClient: MongoClient,
    dbName: string,
    collectionName: string,
  ) {
    const db = mongoClient.db(dbName);
    this.timeTogetherSpentCollection = db.collection(collectionName);
    this.timeTogetherSpentCollection.createIndex(
      {
        userA: 1,
        userB: 1,
      },
      { background: true },
    );
    this.timeTogetherSpentCollection.createIndex(
      { timeSpentTogether: -1 },
      { background: true },
    );
  }
  public getOne(filter: any): Promise<T> {
    return this.timeTogetherSpentCollection.findOne(
      filter,
    ) as unknown as Promise<T>;
  }

  public save(data: T, filter?: any): Promise<void> {
    const update = { $set: { ...data } };
    const promise = new Promise<void>((resolve, reject) => {
      this.timeTogetherSpentCollection
        .updateOne(filter, update, { upsert: true })
        .then(() => {
          resolve();
        })
        .catch((error) => {
          Logger.error(error);
          reject(error);
        });
    });

    return promise;
  }

  public get(filter: any, limit: number): Promise<T[]> {
    return this.timeTogetherSpentCollection
      .find(filter)
      .sort({ timeSpentTogether: -1 })
      .limit(limit)
      .toArray() as unknown as Promise<T[]>;
  }
}
