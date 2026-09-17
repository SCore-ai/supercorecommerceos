export type SearchQuery = {
  tenantId: string;
  term: string;
};

export type SearchHit = {
  id: string;
  entity: string;
};

export interface SearchProvider {
  search(query: SearchQuery): Promise<SearchHit[]>;
}

export class UnimplementedSearchProvider implements SearchProvider {
  async search(_query: SearchQuery): Promise<SearchHit[]> {
    throw new Error('SearchProvider is an interface boundary only in Phase 0');
  }
}
