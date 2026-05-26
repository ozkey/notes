import { Button, Card, CardContent } from "@mui/material";
import React, { useContext, useRef } from "react";
import BibleContext from "../contexts/BibleContext";
import Editor from "./Editor/Editor";

export const StudyPanel: React.FC = () => {
  const { tabs, currentTab, updateTab } = useContext(
    BibleContext as React.Context<any>,
  );

  const current = tabs[currentTab] ?? {
    selectedBook: null,
    chapterNumber: 1,
    notes: "",
  };

  // Keep the file handle so subsequent saves write to the same location/name.
  const fileHandleRef = useRef<any>(null);

  // Save current notes to a .json file. Uses the File System Access API when available,
  // otherwise falls back to creating a downloadable blob.
  const saveNotesToFile = async () => {
    const payload = {
      selectedBook: current.selectedBook,
      chapterNumber: current.chapterNumber,
      notes: current.notes,
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
      const parsed = JSON.parse(text);

      // Allow files that are either a raw string, an object with 'notes', or full payload.
      const notes =
        typeof parsed === "string"
          ? parsed
          : parsed && parsed.notes
            ? parsed.notes
            : "";

      updateTab(currentTab, { notes });
    } catch (err) {
      console.error("Failed to load notes:", err);
      alert("Loading notes was cancelled or failed.");
    }
  };

  return (
    <Card>
      <CardContent>
        <Button variant="outlined" onClick={() => loadNotesFromFile()}>
          Load
        </Button>
        <Button variant="outlined" onClick={() => saveNotesToFile()}>
          Save
        </Button>

        <Editor
          value={current.notes}
          onChange={(html) => updateTab(currentTab, { notes: html })}
          onSave={(html) => {
            console.log("Saving notes to file", html);
            updateTab(currentTab, { notes: html });
          }}
        />
      </CardContent>
    </Card>
  );
};
