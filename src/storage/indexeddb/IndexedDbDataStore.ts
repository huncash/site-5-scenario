import type {
  DataStore,
  DataStoreSchema,
  DataStoreTransaction,
} from "@/storage/DataStore";

type StoreName<TSchema extends DataStoreSchema> = Extract<
  keyof TSchema,
  string
>;

type IndexedDbDataStoreOptions = {
  name: string;
  version: number;
  upgrade: (
    database: IDBDatabase,
    transaction: IDBTransaction,
    oldVersion: number,
    newVersion: number | null,
  ) => void;
};

function requestResult<TResult>(request: IDBRequest<TResult>): Promise<TResult> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export class IndexedDbDataStore<TSchema extends DataStoreSchema>
  implements DataStore<TSchema>
{
  constructor(private readonly options: IndexedDbDataStoreOptions) {}

  private open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.options.name, this.options.version);
      request.onupgradeneeded = (event) => {
        this.options.upgrade(
          request.result,
          request.transaction!,
          event.oldVersion,
          event.newVersion,
        );
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  get<TStore extends StoreName<TSchema>>(
    store: TStore,
    key: TSchema[TStore]["key"],
  ): Promise<TSchema[TStore]["value"] | undefined> {
    return this.transaction([store], "readonly", (transaction) =>
      transaction.get(store, key),
    );
  }

  getAll<TStore extends StoreName<TSchema>>(
    store: TStore,
  ): Promise<Array<TSchema[TStore]["value"]>> {
    return this.transaction([store], "readonly", (transaction) =>
      transaction.getAll(store),
    );
  }

  save<TStore extends StoreName<TSchema>>(
    store: TStore,
    value: TSchema[TStore]["value"],
  ): Promise<void> {
    return this.transaction([store], "readwrite", (transaction) =>
      transaction.save(store, value),
    );
  }

  delete<TStore extends StoreName<TSchema>>(
    store: TStore,
    key: TSchema[TStore]["key"],
  ): Promise<void> {
    return this.transaction([store], "readwrite", (transaction) =>
      transaction.delete(store, key),
    );
  }

  async transaction<TResult>(
    stores: Array<StoreName<TSchema>>,
    mode: "readonly" | "readwrite",
    operation: (
      transaction: DataStoreTransaction<TSchema>,
    ) => Promise<TResult>,
  ): Promise<TResult> {
    if (stores.length === 0) {
      throw new Error("A tranzakcióhoz legalább egy store szükséges.");
    }

    const database = await this.open();
    const idbTransaction = database.transaction(stores, mode);

    const transaction: DataStoreTransaction<TSchema> = {
      get: async (store, key) => {
        const result = await requestResult(
          idbTransaction.objectStore(store).get(key),
        );
        return result as TSchema[typeof store]["value"] | undefined;
      },
      getAll: async (store) => {
        const result = await requestResult(
          idbTransaction.objectStore(store).getAll(),
        );
        return result as Array<TSchema[typeof store]["value"]>;
      },
      save: async (store, value) => {
        await requestResult(idbTransaction.objectStore(store).put(value));
      },
      delete: async (store, key) => {
        await requestResult(idbTransaction.objectStore(store).delete(key));
      },
    };

    return new Promise<TResult>((resolve, reject) => {
      let result: TResult | undefined;
      let operationError: unknown;
      let operationSettled = false;

      // IndexedDB auto-commits when no request is pending. Keep one harmless
      // request queued so an async transaction callback cannot become inactive
      // between awaited CRUD calls.
      const keepAliveStore = idbTransaction.objectStore(stores[0]);
      const keepAlive = () => {
        if (operationSettled) return;
        const request = keepAliveStore.count();
        request.onsuccess = keepAlive;
        request.onerror = keepAlive;
      };
      keepAlive();

      void operation(transaction)
        .then((value) => {
          result = value;
          operationSettled = true;
        })
        .catch((error: unknown) => {
          operationError = error;
          operationSettled = true;
          try {
            idbTransaction.abort();
          } catch {
            reject(error);
          }
        });

      idbTransaction.oncomplete = () => {
        database.close();
        resolve(result as TResult);
      };
      idbTransaction.onerror = () => {
        database.close();
        reject(operationError ?? idbTransaction.error);
      };
      idbTransaction.onabort = () => {
        database.close();
        reject(operationError ?? idbTransaction.error);
      };
    });
  }

  async reset(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase(this.options.name);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      // Keep waiting: deleteDatabase cannot be cancelled and will continue
      // automatically after another tab releases its connection.
      request.onblocked = () => undefined;
    });
  }
}
