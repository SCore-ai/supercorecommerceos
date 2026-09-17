export type StoredFile = {
  id: string;
  key: string;
  contentType: string;
};

export interface FileStorageProvider {
  put(input: { key: string; body: Uint8Array; contentType: string }): Promise<StoredFile>;
  get(key: string): Promise<Uint8Array | null>;
  delete(key: string): Promise<void>;
}

export class UnimplementedFileStorageProvider implements FileStorageProvider {
  async put(): Promise<StoredFile> {
    throw new Error('FileStorageProvider is an interface boundary only in Phase 0');
  }

  async get(): Promise<Uint8Array | null> {
    throw new Error('FileStorageProvider is an interface boundary only in Phase 0');
  }

  async delete(): Promise<void> {
    throw new Error('FileStorageProvider is an interface boundary only in Phase 0');
  }
}
