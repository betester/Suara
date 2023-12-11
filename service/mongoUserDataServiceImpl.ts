import { User } from "../models";
import { UserDataService } from "./userDataService";
import { MongoClient, ObjectId } from "mongodb"
import jsLogger, { ILogger } from "js-logger"

jsLogger.useDefaults()

const Logger: ILogger = jsLogger.get("mongoUserDataServiceImpl")

export class MongoUserDataServiceImpl<T extends User> implements UserDataService<T> {

  private mongoClient: MongoClient
  private dbName: string
  private collectionName: string

  constructor(mongoClient: MongoClient, dbName: string, collectionName: string) {
    this.mongoClient = mongoClient
    this.dbName = dbName
    this.collectionName = collectionName
  }

  public save(key: string, user: T) {
    const db = this.mongoClient.db(this.dbName)
    const userCollection = db.collection(this.collectionName)
    const userDocument = {
      _id: new ObjectId(key),
      ...user
    }

    userCollection
      .insertOne(userDocument)
      .catch(error => {
        Logger.error(error)
      })
  }
  public get(key: string): Promise<T | null> {

    const db = this.mongoClient.db(this.dbName)
    const userCollection = db.collection(this.collectionName)
    const _id = new ObjectId(key)
    return userCollection.findOne({ _id }) as unknown as Promise<T>
  }
}
