exports.getOrCreateKey = (collection, key, objectType) => {
    if (!collection.get(key)) {
      collection.set(key, new objectType());
    }
  
    return collection.get(key);
  };