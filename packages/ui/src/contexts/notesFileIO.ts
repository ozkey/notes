import React from "react";
// Use webpack inline loader syntax to import CSS as raw string
import editorCss from "!!raw-loader!../components/Editor/Editor.css";

// Small helper file to handle saving/loading notes via File System Access API
// or fallback download/input elements.

// HTML template with DATA START and DATA END markers
const TEMPLATE_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Notes</title>
    <style>
      :root {
        --bg: #f6f2e9;
        --surface: #fffdf8;
        --surface-alt: #fffcf7;
        --border: rgba(45, 90, 72, 0.2);
        --border-strong: rgba(45, 90, 72, 0.3);
        --text: #2d3a35;
        --text-muted: #56645e;
        --accent: #2d5a48;
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        padding: 0;
      }

      body {
        font-family: "Segoe UI", "Inter", "Roboto", Arial, sans-serif;
        line-height: 1.55;
        color: var(--text);
        background: linear-gradient(180deg, #faf7f1 0%, var(--bg) 100%);
        padding: 24px;
      }

      h1 {
        margin: 0 0 16px;
        color: #1f3f33;
        font-size: clamp(1.5rem, 2vw + 1rem, 2.15rem);
      }

      #indexList {
        background: var(--surface-alt);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 14px 16px;
        margin: 0 0 18px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
      }

      .index-list {
        margin: 0;
        padding-left: 18px;
        columns: 2;
        column-gap: 28px;
      }

      .index-list li {
        margin: 6px 0;
        break-inside: avoid;
      }

      .index-list a {
        color: var(--accent);
        border-bottom: 1px solid transparent;
      }

      #displayNotes {
        display: grid;
        gap: 14px;
      }

      article.note {
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 16px;
        background: var(--surface);
        display: flow-root;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
      }

      article.note > h2 {
        margin: 0 0 10px;
        font-size: 1.1rem;
        color: #214637;
      }

      .note-content {
        color: var(--text);
      }

      .note-content p {
        margin: 0 0 0.9em;
      }

      .note-content h1,
      .note-content h2,
      .note-content h3,
      .note-content h4 {
        margin: 1em 0 0.5em;
        line-height: 1.3;
      }

      .note-content ul,
      .note-content ol {
        margin: 0 0 0.9em;
        padding-left: 1.5rem;
      }

      .note-content li {
        margin: 0.25em 0;
      }

      .note-content a {
        color: var(--accent);
      }

      .note-content pre {
        background: #1f2328;
        color: #e4e7eb;
        border-radius: 8px;
        padding: 12px;
        overflow-x: auto;
      }

      .note-content code {
        font-family: "Consolas", "Courier New", monospace;
      }

      .note-content table,
      .note-content .editor-table {
        width: 100%;
        border-collapse: collapse;
      }

      .note-content table td,
      .note-content table th,
      .note-content .editor-table td,
      .note-content .editor-table th {
        border: 1px solid #a3b2ab;
        padding: 7px;
        vertical-align: top;
      }

      .note-content blockquote {
        margin: 0.8em 0;
        padding: 10px 12px;
        border-left: 4px solid #2d5a48;
        background: #eef4f0;
        border-radius: 0 8px 8px 0;
      }

      .note-content blockquote.editor-alert-info {
        border-left-color: #0277bd;
        background: #e1f5fe;
      }

      .note-content blockquote.editor-alert-warning {
        border-left-color: #ef6c00;
        background: #fff3e0;
      }

      .note-content blockquote.editor-alert-error {
        border-left-color: #c62828;
        background: #ffebee;
      }

      .note-content .editor-highlight-badge {
        display: inline-block;
        background-color: #c8e6c9;
        border: 1px solid #88a88f;
        border-radius: 999px;
        font-weight: 700;
        font-size: 0.85em;
        line-height: 1.2;
        padding: 0.15em 0.55em;
        margin-right: 0.35em;
        color: #1e372d;
        vertical-align: baseline;
      }

      .note-content .editor-highlight-badge[data-color="blue"] {
        background-color: #bbdefb;
        border-color: #87abc8;
      }

      .note-content .editor-highlight-badge[data-color="pink"] {
        background-color: #f8bbd0;
        border-color: #c98ea2;
      }

      .note-content .editor-highlight-badge[data-color="red"] {
        background-color: #ffcdd2;
        border-color: #d39aa1;
      }

      .note-content .editor-highlight-badge[data-color="orange"] {
        background-color: #ffe0b2;
        border-color: #d7b388;
      }

      .note-content .editor-highlight-badge[data-color="purple"] {
        background-color: #e1bee7;
        border-color: #b996c0;
      }

      .note-content .editor-highlight-badge[data-color="white"] {
        background-color: #ffffff;
        border-color: #d7d7d7;
      }

      @media (max-width: 900px) {
        body {
          padding: 14px;
        }

        .index-list {
          columns: 1;
        }
      }

      /* Editor styles - imported from Editor.css */
      ${editorCss || "/* Editor CSS failed to load */"}
    </style>
  </head>
  <body>
    <script>
      const data =
        // ========= DATA START =========
        {
          notes: [],
          articles: [],
          savedAt: "",
        };
      // ========= DATA END =========

        // Script to append each saved note/article into the #displayNotes container.
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

         if (!data) {
           console.warn("No data found.");
           return;
         }

         const noteEntries = Array.isArray(data.notes) ? data.notes : [];
         const articleEntries = Array.isArray(data.articles) ? data.articles : [];
         const combined = [
           ...noteEntries.map((note) => ({ type: "note", value: note })),
           ...articleEntries.map((article) => ({ type: "article", value: article })),
         ];

        combined.forEach((entry, index) => {
          try {
            const article = document.createElement("article");
            article.className = "note";
            article.dataset.index = index;

            const articleId =
              entry.type === "article"
                ? String(entry.value.id || "Unknown ID").replace(/^#/, "")
                : \`\${entry.value.book || "Unknown Book"}:\${
                    entry.value.chapterNumber !== undefined &&
                    entry.value.chapterNumber !== null
                      ? entry.value.chapterNumber
                      : "Unknown Chapter"
                  }\`;
            article.id = articleId;

            const heading = document.createElement("h2");
            if (entry.type === "article") {
              heading.textContent = \`Article \${articleId}\`;
            } else {
              const book = entry.value.book || "Unknown Book";
              const chapter =
                entry.value.chapterNumber !== undefined &&
                entry.value.chapterNumber !== null
                  ? entry.value.chapterNumber
                  : "Unknown Chapter";
              heading.textContent = \`\${book} \${chapter}\`;
            }
            article.appendChild(heading);

            const content = document.createElement("div");
            content.className = "note-content";

            content.innerHTML = entry.value.text || "";
            article.appendChild(content);

            container.appendChild(article);

            // Add to index list if present
            if (indexListEl) {
              const li = document.createElement("li");
              const a = document.createElement("a");
              a.href = \`#\${encodeURIComponent(article.id)}\`;
              if (entry.type === "article") {
                a.textContent = \`Article \${articleId}\`;
                a.setAttribute("aria-label", \`Go to Article \${articleId}\`);
              } else {
                const book = entry.value.book || "Unknown Book";
                const chapter =
                  entry.value.chapterNumber !== undefined &&
                  entry.value.chapterNumber !== null
                    ? entry.value.chapterNumber
                    : "Unknown Chapter";
                a.textContent = \`\${book} \${chapter}\`;
                a.setAttribute("aria-label", \`Go to \${book} \${chapter}\`);
              }
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
const isAbortError = (err: unknown): boolean =>
  err instanceof DOMException
    ? err.name === "AbortError"
    : typeof err === "object" &&
      err !== null &&
      "name" in err &&
      (err as { name?: unknown }).name === "AbortError";

export async function saveNotesToFile(
  notes: any[],
  articles: any[],
  fileHandleRef: React.MutableRefObject<any | null>,
): Promise<boolean> {
  const payload = {
    notes: notes,
    articles: articles,
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
    return false;
  }

  const beforeData = TEMPLATE_HTML.substring(
    0,
    startIndex + dataMarkerStart.length,
  );
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
    return true;
  } catch (err) {
    if (isAbortError(err)) return false;
    console.error("Failed to save notes:", err);
    alert("Saving notes was cancelled or failed.");
    return false;
  }
}

// Load notes from an HTML file by extracting data between DATA START and DATA END comments.
// Accepts fileHandleRef so the remembered handle can be saved for later writes.
export async function loadNotesFromFile(
  fileHandleRef: React.MutableRefObject<any | null>,
  replaceAllNotes: (entries: any[]) => void,
  replaceAllArticles: (entries: any[]) => void,
): Promise<boolean> {
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

    if (!file) return false;

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
    // - { notes: [...], articles: [...] }
    // - array of entries
    // - raw string -> wrap as a single note
    let loadedNotes: any[] = [];
    let loadedArticles: any[] = [];
    if (Array.isArray(parsed)) {
      loadedNotes = parsed;
    } else if (parsed && parsed.notes && Array.isArray(parsed.notes)) {
      loadedNotes = parsed.notes;
      if (Array.isArray(parsed.articles)) loadedArticles = parsed.articles;
    } else if (typeof parsed === "string") {
      loadedNotes = [{ book: null, chapterNumber: 1, text: parsed }];
    } else if (parsed && parsed.text) {
      loadedNotes = [parsed];
    }

    replaceAllNotes(loadedNotes as any[]);
    replaceAllArticles(loadedArticles as any[]);
    return true;
  } catch (err) {
    if (isAbortError(err)) return false;
    console.error("Failed to load notes:", err);
    alert("Loading notes was cancelled or failed.");
    return false;
  }
}
