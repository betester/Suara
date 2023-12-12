import { MemoryStorage } from "node-ts-cache-storage-memory";
import { ICacheItem } from "node-ts-cache";
import { LocalStorage } from "./localStorage";

export class MemoryCache<T> implements LocalStorage<T> {
  private memoryStorage: MemoryStorage;

  constructor(memoryStorage: MemoryStorage) {
    this.memoryStorage = memoryStorage;
  }

  public save(key: string, value: T, ttl: number) {
    const item: ICacheItem = {
      content: value,
      meta: {
        createdAt: Date.now(),
        ttl,
      },
    };
    this.memoryStorage.setItem(key, item);
  }

  public get(key: string): Promise<T | null> {
    const promise: Promise<T | null> = new Promise<T | null>(
      (resolve, reject) => {
        this.memoryStorage
          .getItem(key)
          .then((item) => {
            const currentTime: number = Date.now();
            if (currentTime >= item.meta.createdAt + item.meta.ttl * 1000) {
              this.memoryStorage.setItem(key, null);
              reject(new Error("time limit exceeded"));
            } else {
              resolve(item.content);
            }
          })
          .catch((error) => {
            reject(error);
          });
      },
    );

    return promise;
  }
}
