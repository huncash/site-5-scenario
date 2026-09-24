export type StoreDefinition<TKey, TValue> = {
  key: TKey;
  value: TValue;
};

export type DataStoreKey = string | number;

export type DataStoreSchema = Record<
  string,
  StoreDefinition<DataStoreKey, unknown>
>;

type StoreName<TSchema extends DataStoreSchema> = Extract<
  keyof TSchema,
  string
>;

type StoreKey<
  TSchema extends DataStoreSchema,
  TStore extends StoreName<TSchema>,
> = TSchema[TStore]["key"];

type StoreValue<
  TSchema extends DataStoreSchema,
  TStore extends StoreName<TSchema>,
> = TSchema[TStore]["value"];

export interface DataStoreTransaction<TSchema extends DataStoreSchema> {
  get<TStore extends StoreName<TSchema>>(
    store: TStore,
    key: StoreKey<TSchema, TStore>,
  ): Promise<StoreValue<TSchema, TStore> | undefined>;

  getAll<TStore extends StoreName<TSchema>>(
    store: TStore,
  ): Promise<Array<StoreValue<TSchema, TStore>>>;

  save<TStore extends StoreName<TSchema>>(
    store: TStore,
    value: StoreValue<TSchema, TStore>,
  ): Promise<void>;

  delete<TStore extends StoreName<TSchema>>(
    store: TStore,
    key: StoreKey<TSchema, TStore>,
  ): Promise<void>;
}

/**
 * Storage-independent CRUD boundary.
 *
 * A future mesh adapter can wrap this interface and append sync events after
 * save/delete without changing callers in the UI or domain layer.
 */
export interface DataStore<TSchema extends DataStoreSchema>
  extends DataStoreTransaction<TSchema> {
  /**
   * Runs CRUD calls atomically. The callback may only await methods exposed by
   * the supplied transaction; unrelated timers, fetches or other async work
   * must happen before entering the transaction.
   */
  transaction<TResult>(
    stores: Array<StoreName<TSchema>>,
    mode: "readonly" | "readwrite",
    operation: (
      transaction: DataStoreTransaction<TSchema>,
    ) => Promise<TResult>,
  ): Promise<TResult>;

  reset(): Promise<void>;
}
