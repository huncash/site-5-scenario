/**
 * Mesh Data Manager – storage boundary.
 *
 * This is intentionally small: CRUD only. Later, a P2P/WebRTC implementation
 * can implement the same interface and replicate changes without touching UI.
 */

export type StoreKey = string | number;

export type StoreDefinition<TKey extends StoreKey, TValue> = {
  key: TKey;
  value: TValue;
};

export type DataStoreSchema = Record<string, StoreDefinition<StoreKey, unknown>>;

type StoreName<TSchema extends DataStoreSchema> = Extract<keyof TSchema, string>;
type StoreKeyOf<
  TSchema extends DataStoreSchema,
  TStore extends StoreName<TSchema>,
> = TSchema[TStore]["key"];
type StoreValueOf<
  TSchema extends DataStoreSchema,
  TStore extends StoreName<TSchema>,
> = TSchema[TStore]["value"];

export interface DataStore<TSchema extends DataStoreSchema> {
  get<TStore extends StoreName<TSchema>>(
    store: TStore,
    key: StoreKeyOf<TSchema, TStore>,
  ): Promise<StoreValueOf<TSchema, TStore> | undefined>;

  getAll<TStore extends StoreName<TSchema>>(
    store: TStore,
  ): Promise<Array<StoreValueOf<TSchema, TStore>>>;

  save<TStore extends StoreName<TSchema>>(
    store: TStore,
    value: StoreValueOf<TSchema, TStore>,
  ): Promise<void>;

  delete<TStore extends StoreName<TSchema>>(
    store: TStore,
    key: StoreKeyOf<TSchema, TStore>,
  ): Promise<void>;
}

type KeyOfValue<
  TSchema extends DataStoreSchema,
  TStore extends StoreName<TSchema>,
> = (value: StoreValueOf<TSchema, TStore>) => StoreKeyOf<TSchema, TStore>;

type InMemoryOptions<TSchema extends DataStoreSchema> = {
  /**
   * How to compute keys for values on `save`.
   * If omitted, `value.id` is used when present.
   */
  keyOf?: Partial<{
    [TStore in StoreName<TSchema>]: KeyOfValue<TSchema, TStore>;
  }>;
};

/**
 * Simple in-memory implementation (Map per store).
 * Good for tests and as a drop-in placeholder before IndexedDB/P2P adapters.
 */
export class InMemoryDataStore<TSchema extends DataStoreSchema>
  implements DataStore<TSchema>
{
  private readonly tables = new Map<StoreName<TSchema>, Map<StoreKey, unknown>>();

  constructor(private readonly options: InMemoryOptions<TSchema> = {}) {}

  async get<TStore extends StoreName<TSchema>>(
    store: TStore,
    key: StoreKeyOf<TSchema, TStore>,
  ): Promise<StoreValueOf<TSchema, TStore> | undefined> {
    const table = this.table(store);
    return table.get(key as StoreKey) as StoreValueOf<TSchema, TStore> | undefined;
  }

  async getAll<TStore extends StoreName<TSchema>>(
    store: TStore,
  ): Promise<Array<StoreValueOf<TSchema, TStore>>> {
    const table = this.table(store);
    return Array.from(table.values()) as Array<StoreValueOf<TSchema, TStore>>;
  }

  async save<TStore extends StoreName<TSchema>>(
    store: TStore,
    value: StoreValueOf<TSchema, TStore>,
  ): Promise<void> {
    const key = this.keyOf(store, value);
    this.table(store).set(key as StoreKey, value);
  }

  async delete<TStore extends StoreName<TSchema>>(
    store: TStore,
    key: StoreKeyOf<TSchema, TStore>,
  ): Promise<void> {
    this.table(store).delete(key as StoreKey);
  }

  private table<TStore extends StoreName<TSchema>>(
    store: TStore,
  ): Map<StoreKey, unknown> {
    let table = this.tables.get(store);
    if (!table) {
      table = new Map();
      this.tables.set(store, table);
    }
    return table;
  }

  private keyOf<TStore extends StoreName<TSchema>>(
    store: TStore,
    value: StoreValueOf<TSchema, TStore>,
  ): StoreKeyOf<TSchema, TStore> {
    const custom = this.options.keyOf?.[store] as
      | KeyOfValue<TSchema, TStore>
      | undefined;
    if (custom) return custom(value);

    if (value && typeof value === "object" && "id" in value) {
      const id = (value as { id: unknown }).id;
      if (typeof id === "string" || typeof id === "number") {
        return id as StoreKeyOf<TSchema, TStore>;
      }
    }

    throw new Error(
      `InMemoryDataStore: missing keyOf(${String(store)}) and value.id is not a string|number`,
    );
  }
}

type LocalStorageOptions = {
  namespace?: string;
  storage?: Pick<Storage, "getItem" | "setItem" | "removeItem">;
};

/**
 * localStorage-backed store.
 *
 * Notes:
 * - Values must be JSON-serializable.
 * - This is a simple persistence option; for offline-first at scale prefer
 *   IndexedDB later (and this interface makes swapping easy).
 */
export class LocalStorageDataStore<TSchema extends DataStoreSchema>
  implements DataStore<TSchema>
{
  private readonly mem: InMemoryDataStore<TSchema>;
  private readonly ns: string;
  private readonly storage: Pick<Storage, "getItem" | "setItem" | "removeItem">;

  constructor(options: LocalStorageOptions = {}, memOptions: InMemoryOptions<TSchema> = {}) {
    this.ns = options.namespace ?? "mesh-datastore";
    this.storage = options.storage ?? localStorage;
    this.mem = new InMemoryDataStore<TSchema>(memOptions);
  }

  async get<TStore extends StoreName<TSchema>>(
    store: TStore,
    key: StoreKeyOf<TSchema, TStore>,
  ): Promise<StoreValueOf<TSchema, TStore> | undefined> {
    this.hydrate(store);
    return this.mem.get(store, key);
  }

  async getAll<TStore extends StoreName<TSchema>>(
    store: TStore,
  ): Promise<Array<StoreValueOf<TSchema, TStore>>> {
    this.hydrate(store);
    return this.mem.getAll(store);
  }

  async save<TStore extends StoreName<TSchema>>(
    store: TStore,
    value: StoreValueOf<TSchema, TStore>,
  ): Promise<void> {
    this.hydrate(store);
    await this.mem.save(store, value);
    this.persist(store);
  }

  async delete<TStore extends StoreName<TSchema>>(
    store: TStore,
    key: StoreKeyOf<TSchema, TStore>,
  ): Promise<void> {
    this.hydrate(store);
    await this.mem.delete(store, key);
    this.persist(store);
  }

  private cache = new Set<string>();

  private keyForStore(store: string) {
    return `${this.ns}:${store}`;
  }

  private hydrate<TStore extends StoreName<TSchema>>(store: TStore) {
    const key = this.keyForStore(String(store));
    if (this.cache.has(key)) return;
    this.cache.add(key);

    const raw = this.storage.getItem(key);
    if (!raw) return;

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    for (const [, value] of Object.entries(parsed)) {
      // key is derived by `mem.save`, so we can re-save values.
      void this.mem.save(store, value as StoreValueOf<TSchema, TStore>);
    }
  }

  private persist<TStore extends StoreName<TSchema>>(store: TStore) {
    const key = this.keyForStore(String(store));
    void this.mem.getAll(store).then((values) => {
      const obj: Record<string, unknown> = {};
      for (const v of values) {
        // Reuse mem's keying logic by saving into a shadow map is overkill.
        // For persistence we store an array keyed by index.
        obj[String(Object.keys(obj).length)] = v as unknown;
      }
      this.storage.setItem(key, JSON.stringify(obj));
    });
  }
}

