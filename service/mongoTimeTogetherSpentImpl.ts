import { TimeTogetherSpentService } from ".";
import { TimeTogetherSpent } from "../models";
import { MongoClient, Collection, Document } from "mongodb";
import jsLogger from "js-logger"

jsLogger.useDefaults()

const Logger = jsLogger.get("mongoTimeTogetherSpentImpl")


export class MongoTimeTogetherSpentImpl<T extends TimeTogetherSpent> implements TimeTogetherSpentService<T> {

  private timeTogetherSpentCollection: Collection<Document>

  constructor(mongoClient: MongoClient, dbName: string, collectionName: string) {
    const db = mongoClient.db(dbName)
    this.timeTogetherSpentCollection = db.collection(collectionName)
    this.timeTogetherSpentCollection.createIndex(
      {
        userA: 1,
        userB: 1
      },
      {
        background: true
      }
    )

  }

  public save(data: T) {
    this.setUserIdOrdering(data)

    const { userA, userB } = data
    const filter = {
      userA,
      userB
    };
    const update = { $set: { ...data } };

    this.timeTogetherSpentCollection
      .updateOne(filter, update, { upsert: true })
      .catch((error) => {
        Logger.error(error);
      });
  }

  public get(key: string): Promise<T> {
    const filter = {
      "$or": [
        {
          userA: key
        },
        {
          userB: key
        }
      ]
    }

    return this.timeTogetherSpentCollection.findOne(filter) as unknown as Promise<T>
  }

  private setUserIdOrdering(data: T) {
    // ensure that userA < userB
    const { userA, userB } = data

    if (userA.localeCompare(userB) > 0) {
      data.userA, data.userB = userB, userA
    }
  }
}
