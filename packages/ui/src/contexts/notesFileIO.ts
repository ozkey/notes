import React from "react";

// Small helper file to handle saving/loading notes via File System Access API
// or fallback download/input elements.

// HTML template with DATA START and DATA END markers
const TEMPLATE_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Notes</title>
    <style>
      article {
        border: 1px solid #ccc;
        padding: 1em;
        margin: 1em;
      }
      #indexList {
        border: 1px solid #ccc;
        padding: 1em;
        margin: 1em;
      }
    </style>
  </head>
  <body>
    <script>
      const data =
        // ========= DATA START =========
        {
          notes: [],
          savedAt: "",
        };
      // ========= DATA END =========

      // Script to append each note into the #displayNotes container as an <article>
      function addNotesToDisplay() {
        const container = document.getElementById("displayNotes");
        const indexContainer = document.getElementById("indexList");
        if (!container) {
          console.warn('No element with id "displayNotes" found.');
          return;
        }

        // Clear any existing content
        container.innerHTML = "";

        // Prepare index if available
        let indexListEl = null;
        if (indexContainer) {
          indexContainer.innerHTML = "";
          indexListEl = document.createElement("ul");
          indexListEl.className = "index-list";
        }

        if (!data || !Array.isArray(data.notes)) {
          console.warn("No notes found in data.");
          return;
        }

        data.notes.forEach((note, index) => {
          try {
            const article = document.createElement("article");
            article.className = "note";
            article.dataset.index = index;
            article.id = \`note-\${index}\`; // add id so links can target it

            const book = note.book || "Unknown Book";
            const chapter =
              note.chapterNumber !== undefined && note.chapterNumber !== null
                ? note.chapterNumber
                : "Unknown Chapter";

            const heading = document.createElement("h2");
            heading.textContent = \`\${book} \${chapter}\`;
            article.appendChild(heading);

            const content = document.createElement("div");
            content.className = "note-content";

            // note.text is HTML string in the data; insert as HTML
            content.innerHTML = note.text || "";
            article.appendChild(content);

            container.appendChild(article);

            // Add to index list if present
            if (indexListEl) {
              const li = document.createElement("li");
              const a = document.createElement("a");
              a.href = \`#\${article.id}\`;
              a.textContent = \`\${book} \${chapter}\`;
              a.setAttribute("aria-label", \`Go to \${book} \${chapter}\`);
              li.appendChild(a);
              indexListEl.appendChild(li);
            }
          } catch (err) {
            console.error("Failed to render note at index", index, err);
          }
        });

        if (indexListEl && indexContainer) {
          indexContainer.appendChild(indexListEl);
        }
      }

      // Populate when DOM is ready
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", addNotesToDisplay);
      } else {
        addNotesToDisplay();
      }
    </script>

    <h1>Your Notes</h1>
    <div id="indexList"></div>

    <div id="displayNotes"></div>
  </body>
</html>`;

// Save notes to an HTML file with data embedded between DATA START and DATA END comments.
// The notes and metadata are embedded as a JavaScript object in the HTML template.
export async function saveNotesToFile(
  notes: any[],
  fileHandleRef: React.MutableRefObject<any | null>,
): Promise<void> {
  const payload = {
    notes: notes,
    savedAt: new Date().toISOString(),
  };

  const json = JSON.stringify(payload, null, 2);

  // Replace the placeholder data between DATA START and DATA END with the actual payload
  const dataMarkerStart = "// ========= DATA START =========";
  const dataMarkerEnd = "// ========= DATA END =========";
  const startIndex = TEMPLATE_HTML.indexOf(dataMarkerStart);
  const endIndex = TEMPLATE_HTML.indexOf(dataMarkerEnd);

  if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find DATA START or DATA END markers in template");
    alert("Failed to save notes: template markers not found.");
    return;
  }

  const beforeData = TEMPLATE_HTML.substring(0, startIndex + dataMarkerStart.length);
  const afterData = TEMPLATE_HTML.substring(endIndex);

  const htmlContent = beforeData + "\n        " + json + "\n      " + afterData;

  try {
    // @ts-ignore - feature-detect the newer File System Access API
    if ((window as any).showSaveFilePicker) {
      // Use remembered handle if present, otherwise prompt once and remember it.
      let handle = fileHandleRef.current;
      if (!handle) {
        // @ts-ignore
        handle = await (window as any).showSaveFilePicker({
          suggestedName: "notes.html",
          types: [
            {
              description: "Notes",
              accept: { "text/html": [".html"] },
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
      await writable.write(htmlContent);
      await writable.close();
    } else {
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "notes.html";
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

// Load notes from an HTML file by extracting data between DATA START and DATA END comments.
// Accepts fileHandleRef so the remembered handle can be saved for later writes.
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
            accept: { "text/html": [".html"], "application/json": [".json"] },
          },
        ],
      });
      // Remember the handle so future saves can write back to the same file.
      fileHandleRef.current = handle;
      file = await handle.getFile();
    } else {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".html,.json,text/html,application/json";
      input.click();

      file = await new Promise<File | null>((resolve) => {
        input.onchange = () => resolve(input.files ? input.files[0] : null);
      });
    }

    if (!file) return;

    const text = await file.text();

    // Try to extract data from HTML file first (between DATA START and DATA END)
    const dataMarkerStart = "// ========= DATA START =========";
    const dataMarkerEnd = "// ========= DATA END =========";
    const startIndex = text.indexOf(dataMarkerStart);
    const endIndex = text.indexOf(dataMarkerEnd);

    let parsed: any;

    if (startIndex !== -1 && endIndex !== -1) {
      // Extract data between markers
      const dataStr = text.substring(
        startIndex + dataMarkerStart.length,
        endIndex,
      );
      // Parse the JSON object
      const jsonMatch = dataStr.match(/{[\s\S]*}/);
      if (!jsonMatch) {
        throw new Error("Could not find JSON data in HTML file");
      }
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      // Fallback: try to parse as plain JSON (for backward compatibility)
      parsed = JSON.parse(text);
    }

    // Normalized parsed -> entries array. Accept multiple formats:
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

