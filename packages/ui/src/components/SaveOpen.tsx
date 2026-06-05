import { Button } from "@mui/material";
import React, { useContext, useRef } from "react";
import BibleContext from "../contexts/BibleContext";

export const SaveOpen: React.FC = () => {
  const { notes, replaceAllNotes } = useContext(
    BibleContext as React.Context<any>,
  );

  // Keep the file handle so subsequent saves write to the same location/name.
  const fileHandleRef = useRef<any>(null);

  // Save current notes to a .json file. Uses the File System Access API when available,
  // otherwise falls back to creating a downloadable blob.
  const saveNotesToFile = async () => {
    const payload = {
      notes: notes,
      savedAt: new Date().toISOString(),
    };

    const json = JSON.stringify(payload, null, 2);

    try {
      // @ts-ignore - feature-detect the newer File System Access API
      if (window.showSaveFilePicker) {
        // Use remembered handle if present, otherwise prompt once and remember it.
        // @ts-ignore
        let handle = fileHandleRef.current;
        if (!handle) {
          // @ts-ignore
          handle = await window.showSaveFilePicker({
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
      // user probably cancelled or an error occurred
      console.error("Failed to save notes:", err);
      alert("Saving notes was cancelled or failed.");
    }
  };

  // Load notes from a .json file and update the current tab's notes.
  const loadNotesFromFile = async () => {
    try {
      let file: File | null;

      // @ts-ignore
      if (window.showOpenFilePicker) {
        // @ts-ignore
        const [handle] = await window.showOpenFilePicker({
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

      console.log("text", text);
      const parsed = JSON.parse(text);

      // Normalized parsed -> entries array. Accept legacy formats:
      // - { notes: [...] }
      // - array of entries
      // - raw string (apply to current book/chapter would be ambiguous) -> wrap as a single note
      let loadedNotes: any[] = [];
      if (Array.isArray(parsed)) {
        loadedNotes = parsed;
      } else if (parsed && parsed.notes && Array.isArray(parsed.notes)) {
        loadedNotes = parsed.notes;
      } else if (typeof parsed === "string") {
        // wrap legacy single-string payload as a single-entry with no book/chapter
        loadedNotes = [{ book: null, chapterNumber: 1, text: parsed }];
      } else if (parsed && parsed.text) {
        // single note object
        loadedNotes = [parsed];
      }

      replaceAllNotes(loadedNotes as any[]);
    } catch (err) {
      console.error("Failed to load notes:", err);
      alert("Loading notes was cancelled or failed.");
    }
  };

  return (
    <>
      <Button variant="outlined" onClick={() => loadNotesFromFile()}>
        Load
      </Button>
      <Button variant="outlined" onClick={() => saveNotesToFile()}>
        Save
      </Button>
    </>
  );
};
