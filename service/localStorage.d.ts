export interface LocalStorage<Type> {
  save : (key : string, value : Type, ttl : number) => void
  get : (key : string) =>  Promise<Type | null>
}
