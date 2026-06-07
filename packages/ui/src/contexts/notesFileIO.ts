import React from "react";

// Small helper file to handle saving/loading notes via File System Access API
// or fallback download/input elements.

// Save notes to a .json file. Mirrors the implementation previously in
// BibleContext but accepts the notes and fileHandleRef as parameters so it
// can be moved out of the large context file.
export async function saveNotesToFile(
  notes: any[],
  fileHandleRef: React.MutableRefObject<any | null>,
): Promise<void> {
  const payload = {
    notes: notes,
    savedAt: new Date().toISOString(),
  };

  const json = JSON.stringify(payload, null, 2);

  try {
    // @ts-ignore - feature-detect the newer File System Access API
    if ((window as any).showSaveFilePicker) {
      // Use remembered handle if present, otherwise prompt once and remember it.
      let handle = fileHandleRef.current;
      if (!handle) {
        // @ts-ignore
        handle = await (window as any).showSaveFilePicker({
          suggestedName: "notes.json",
          types: [
            {
              description: "Notes",
              accept: { "application/json": [".json"] },
            },
          ],
        });
        fileHandleRef.current = handle;
      }

      // Try to get (or request) write permission before creating writable.
      try {
        // @ts-ignore - some browsers implement queryPermission/requestPermission
        if (handle.queryPermission) {
          // @ts-ignore
          const perm = await handle.queryPermission({ mode: "readwrite" });
          if (perm !== "granted") {
            // @ts-ignore
            await handle.requestPermission({ mode: "readwrite" });
          }
        }
      } catch (permErr) {
        // ignore permission helper errors and continue to attempt write
        console.warn("Permission check failed:", permErr);
      }

      const writable = await handle.createWritable();
      await writable.write(json);
      await writable.close();
    } else {
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "notes.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  } catch (err) {
    console.error("Failed to save notes:", err);
    alert("Saving notes was cancelled or failed.");
  }
}

// Load notes from a .json file and return normalized entries via the
// replaceAllNotes callback. Accepts fileHandleRef so the remembered handle can
// be saved for later writes.
export async function loadNotesFromFile(
  fileHandleRef: React.MutableRefObject<any | null>,
  replaceAllNotes: (entries: any[]) => void,
): Promise<void> {
  try {
    let file: File | null;

    // @ts-ignore
    if ((window as any).showOpenFilePicker) {
      // @ts-ignore
      const [handle] = await (window as any).showOpenFilePicker({
        multiple: false,
        types: [
          {
            description: "Notes",
            accept: { "application/json": [".json"] },
          },
        ],
      });
      // Remember the handle so future saves can write back to the same file.
      fileHandleRef.current = handle;
      file = await handle.getFile();
    } else {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json,application/json";
      input.click();

      file = await new Promise<File | null>((resolve) => {
        input.onchange = () => resolve(input.files ? input.files[0] : null);
      });
    }

    if (!file) return;

    const text = await file.text();

    const parsed = JSON.parse(text);

    // Normalized parsed -> entries array. Accept legacy formats:
    // - { notes: [...] }
    // - array of entries
    // - raw string -> wrap as a single note
    let loadedNotes: any[] = [];
    if (Array.isArray(parsed)) {
      loadedNotes = parsed;
    } else if (parsed && parsed.notes && Array.isArray(parsed.notes)) {
      loadedNotes = parsed.notes;
    } else if (typeof parsed === "string") {
      loadedNotes = [{ book: null, chapterNumber: 1, text: parsed }];
    } else if (parsed && parsed.text) {
      loadedNotes = [parsed];
    }

    replaceAllNotes(loadedNotes as any[]);
  } catch (err) {
    console.error("Failed to load notes:", err);
    alert("Loading notes was cancelled or failed.");
  }
}

