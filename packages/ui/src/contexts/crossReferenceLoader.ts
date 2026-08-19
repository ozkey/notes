export interface CrossReferenceEntry {
  from: string;
  to: string;
  votes: number;
}

const CROSS_REFERENCES_PATH = "./public/Refdata/cross_references.json";
let cachedCrossReferences: CrossReferenceEntry[] | null = null;
let pendingCrossReferences: Promise<CrossReferenceEntry[]> | null = null;

/**
 * Fetches the cross reference dataset from the public folder so it is loaded
 * on demand instead of bundled into the main application chunk.
 */
export async function fetchCrossReferences(): Promise<CrossReferenceEntry[]> {
  if (cachedCrossReferences) {
    return cachedCrossReferences;
  }

  if (pendingCrossReferences) {
    return pendingCrossReferences;
  }

  pendingCrossReferences = (async () => {
    const res = await fetch(CROSS_REFERENCES_PATH);

    if (!res.ok) {
      throw new Error(`Failed to fetch cross references: ${res.statusText}`);
    }

    const json = await res.json();

    if (!Array.isArray(json)) {
      throw new Error("Cross references payload is not an array");
    }

    cachedCrossReferences = json as CrossReferenceEntry[];
    return cachedCrossReferences;
  })().finally(() => {
    pendingCrossReferences = null;
  });

  return pendingCrossReferences;
}

export function resetCrossReferencesCacheForTests() {
  cachedCrossReferences = null;
  pendingCrossReferences = null;
}
