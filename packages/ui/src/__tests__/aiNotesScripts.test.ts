import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const { splitAiNotes } = require("../../scripts/split-ai-notes.js");
const { combineAiNotes } = require("../../scripts/combine-ai-notes.js");

const DATA_BLOCK_RE =
  /\/\/ ========= DATA START =========\s*([\s\S]*?)\s*\/\/ ========= DATA END =========/;

function makeHtmlWithData(data: unknown): string {
  return `<!doctype html>
<html>
  <body>
    <script>
      const data =
        // ========= DATA START =========
        ${JSON.stringify(data, null, 2)}
      // ========= DATA END =========
    </script>
  </body>
</html>`;
}

function extractDataFromHtml(html: string) {
  const match = html.match(DATA_BLOCK_RE);
  if (!match) {
    throw new Error("Missing data block");
  }
  return JSON.parse(match[1].trim().replace(/;$/, ""));
}

describe("ai notes split/combine scripts", () => {
  let tempDir: string;
  let sourceFile: string;
  let notesDir: string;
  let articlesDir: string;
  let metaFile: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ai-notes-scripts-"));
    sourceFile = path.join(tempDir, "ai-notes.html");
    notesDir = path.join(tempDir, "notes");
    articlesDir = path.join(tempDir, "articles");
    metaFile = path.join(tempDir, "data-meta.json");
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("split writes filenames without numeric prefixes and disambiguates duplicates", () => {
    const sourceData = {
      notes: [
        { book: "Matthew", chapterNumber: 1, text: "<p>a</p>" },
        { book: "Matthew", chapterNumber: 1, text: "<p>b</p>" },
      ],
      articles: [
        { id: "mary", text: "<p>one</p>" },
        { id: "mary", text: "<p>two</p>" },
      ],
      savedAt: "2026-10-31T07:04:53.155Z",
    };
    fs.writeFileSync(sourceFile, makeHtmlWithData(sourceData), "utf8");

    splitAiNotes({ sourceFile, notesDir, articlesDir, metaFile });

    const noteFiles = fs.readdirSync(notesDir).sort();
    const articleFiles = fs.readdirSync(articlesDir).sort();

    expect(noteFiles).toEqual(["matthew-1-2.json", "matthew-1.json"]);
    expect(articleFiles).toEqual(["mary-2.json", "mary.json"]);
    expect(noteFiles.every((f) => !/^\d/.test(f))).toBe(true);
    expect(articleFiles.every((f) => !/^\d/.test(f))).toBe(true);
  });

  test("combine rebuilds html data from split files regardless of file order", () => {
    const sourceData = {
      notes: [
        { book: "Genesis", chapterNumber: 1, text: "<p>n1</p>" },
        { book: "Exodus", chapterNumber: 1, text: "<p>n2</p>" },
      ],
      articles: [
        { id: "zebra", text: "<p>a1</p>" },
        { id: "alpha", text: "<p>a2</p>" },
      ],
      savedAt: "2026-10-31T07:04:53.155Z",
    };
    fs.writeFileSync(sourceFile, makeHtmlWithData(sourceData), "utf8");

    splitAiNotes({ sourceFile, notesDir, articlesDir, metaFile });
    combineAiNotes({ sourceFile, notesDir, articlesDir, metaFile });

    const rebuilt = extractDataFromHtml(fs.readFileSync(sourceFile, "utf8"));
    expect(rebuilt.savedAt).toBe(sourceData.savedAt);
    expect(rebuilt.notes).toEqual(expect.arrayContaining(sourceData.notes));
    expect(rebuilt.articles).toEqual(expect.arrayContaining(sourceData.articles));
    expect(rebuilt.notes).toHaveLength(sourceData.notes.length);
    expect(rebuilt.articles).toHaveLength(sourceData.articles.length);
  });
});
