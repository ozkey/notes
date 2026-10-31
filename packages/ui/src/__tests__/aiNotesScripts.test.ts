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
  let booksFile: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ai-notes-scripts-"));
    sourceFile = path.join(tempDir, "ai-notes.html");
    notesDir = path.join(tempDir, "notes");
    articlesDir = path.join(tempDir, "articles");
    metaFile = path.join(tempDir, "data-meta.json");
    booksFile = path.join(tempDir, "books.json");
    fs.writeFileSync(booksFile, JSON.stringify(["Genesis", "Exodus", "Matthew", "I Samuel"], null, 2), "utf8");
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
    combineAiNotes({ sourceFile, notesDir, articlesDir, metaFile, booksFile });

    const rebuilt = extractDataFromHtml(fs.readFileSync(sourceFile, "utf8"));
    expect(rebuilt.savedAt).toBe(sourceData.savedAt);
    expect(rebuilt.notes).toEqual(expect.arrayContaining(sourceData.notes));
    expect(rebuilt.articles).toEqual(expect.arrayContaining(sourceData.articles));
    expect(rebuilt.notes).toHaveLength(sourceData.notes.length);
    expect(rebuilt.articles).toHaveLength(sourceData.articles.length);
  });

  test("combine throws when note filename book is not in books list", () => {
    fs.writeFileSync(sourceFile, makeHtmlWithData({ notes: [], articles: [], savedAt: null }), "utf8");
    fs.mkdirSync(notesDir, { recursive: true });
    fs.writeFileSync(
      path.join(notesDir, "unknown-book-1.json"),
      JSON.stringify({ book: "Genesis", chapterNumber: 1, text: "<p>ok</p>" }, null, 2),
      "utf8"
    );

    expect(() => combineAiNotes({ sourceFile, notesDir, articlesDir, metaFile, booksFile })).toThrow(
      /book in filename "unknown-book" is not in books\.json/
    );
  });

  test("combine throws when note book field is not in books list", () => {
    fs.writeFileSync(sourceFile, makeHtmlWithData({ notes: [], articles: [], savedAt: null }), "utf8");
    fs.mkdirSync(notesDir, { recursive: true });
    fs.writeFileSync(
      path.join(notesDir, "genesis-1.json"),
      JSON.stringify({ book: "Unknown Book", chapterNumber: 1, text: "<p>ok</p>" }, null, 2),
      "utf8"
    );

    expect(() => combineAiNotes({ sourceFile, notesDir, articlesDir, metaFile, booksFile })).toThrow(
      /note\.book "Unknown Book" is not in books\.json/
    );
  });

  test("combine throws when bible links use a book not in books list", () => {
    fs.writeFileSync(sourceFile, makeHtmlWithData({ notes: [], articles: [], savedAt: null }), "utf8");
    fs.mkdirSync(notesDir, { recursive: true });
    fs.writeFileSync(
      path.join(notesDir, "genesis-1.json"),
      JSON.stringify(
        {
          book: "Genesis",
          chapterNumber: 1,
          text: '<p><a href="#Unknown Book:1:1">bad</a><a href="#Exodus:1:1">good</a></p>',
        },
        null,
        2
      ),
      "utf8"
    );

    expect(() => combineAiNotes({ sourceFile, notesDir, articlesDir, metaFile, booksFile })).toThrow(
      /bible link "#Unknown Book:1:1" has unknown book "Unknown Book"/
    );
  });

  test("combine allows note hash links to article ids", () => {
    fs.writeFileSync(sourceFile, makeHtmlWithData({ notes: [], articles: [], savedAt: null }), "utf8");
    fs.mkdirSync(notesDir, { recursive: true });
    fs.writeFileSync(
      path.join(notesDir, "genesis-1.json"),
      JSON.stringify(
        {
          book: "Genesis",
          chapterNumber: 1,
          text: '<p><a href="#mary">article</a><a href="#Exodus:1:1">bible</a></p>',
        },
        null,
        2
      ),
      "utf8"
    );

    expect(() => combineAiNotes({ sourceFile, notesDir, articlesDir, metaFile, booksFile })).not.toThrow();
  });

  test("combine accepts Roman numeral filename variants when books use numeric prefixes", () => {
    fs.writeFileSync(sourceFile, makeHtmlWithData({ notes: [], articles: [], savedAt: null }), "utf8");
    fs.mkdirSync(notesDir, { recursive: true });
    fs.writeFileSync(
      path.join(notesDir, "i-samuel-1.json"),
      JSON.stringify(
        {
          book: "I Samuel",
          chapterNumber: 1,
          text: '<p><a href="#1 Samuel:1:1">ok</a></p>',
        },
        null,
        2
      ),
      "utf8"
    );

    expect(() => combineAiNotes({ sourceFile, notesDir, articlesDir, metaFile, booksFile })).not.toThrow();
  });
});
