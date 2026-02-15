export class SearchIndex {
  private index: Map<string, Set<string>> = new Map();

  tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\W+/)
      .filter(Boolean);
  }

  /* ===============================
     Add Note (Prefix Indexing)
  =============================== */
  addNote(noteId: string, text: string) {
    const tokens = this.tokenize(text);

    tokens.forEach((token) => {
      // generate all prefixes
      for (let i = 1; i <= token.length; i++) {
        const prefix = token.slice(0, i);

        if (!this.index.has(prefix)) {
          this.index.set(prefix, new Set());
        }

        this.index.get(prefix)!.add(noteId);
      }
    });
  }

  /* ===============================
     Remove Note
  =============================== */
  removeNote(noteId: string) {
    this.index.forEach((set) => {
      set.delete(noteId);
    });
  }

  /* ===============================
     Search
  =============================== */
  search(query: string): string[] {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return [];

    const resultSet = this.index.get(normalized);

    if (!resultSet) return [];

    return [...resultSet];
  }
}
