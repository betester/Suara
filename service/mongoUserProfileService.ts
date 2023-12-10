import { Db, MongoClient } from "mongodb";
import { UserProfileService } from "./userProfileService";
import { UserProfile } from "../models";

const userProfileCollectionName : string = "userProfile"

export class MongoUserProfileService implements UserProfileService {
  private client : MongoClient

  constructor(client : MongoClient) {
    this.client = client
  }
  
  public save(userProfile : UserProfile) {
    const db : Db = this.client.db()
    const collection = db.collection(userProfileCollectionName)
    collection.insertOne(userProfile)
  }

  public get(userId : string) : Promise<UserProfile | null> {
  }
}
