const fs = require("node:fs");
const path = require("node:path");

const AI_DIR = path.resolve(__dirname, "..", "src", "public", "notes", "ai");
const SOURCE_FILE = path.join(AI_DIR, "ai-notes.html");
const NOTES_DIR = path.join(AI_DIR, "notes");
const ARTICLES_DIR = path.join(AI_DIR, "articles");
const META_FILE = path.join(AI_DIR, "data-meta.json");
const BOOKS_FILE = path.join(AI_DIR, "books.json");

const DATA_BLOCK_RE =
  /(\/\/ ========= DATA START =========\s*)([\s\S]*?)(\s*\/\/ ========= DATA END =========)/;

function readJsonFiles(dirPath, { includeFileName = false } = {}) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((fileName) => {
      const filePath = path.join(dirPath, fileName);
      const content = fs.readFileSync(filePath, "utf8");
      const data = JSON.parse(content);
      return includeFileName ? { fileName, data } : data;
    });
}

function normalizeBookToken(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/^[#]/, "")
    .replace(/%20/gi, " ")
    .replace(/[_-]+/g, " ")
    .replace(/[.'’]/g, "")
    .replace(/\s+/g, " ");
}

function swapLeadingNumberStyle(token) {
  const romanToArabic = { i: "1", ii: "2", iii: "3", iv: "4", v: "5" };
  const arabicToRoman = { 1: "i", 2: "ii", 3: "iii", 4: "iv", 5: "v" };

  const romanMatch = token.match(/^(iii|ii|iv|v|i)\s+(.+)$/);
  if (romanMatch) {
    return `${romanToArabic[romanMatch[1]]} ${romanMatch[2]}`;
  }

  const arabicMatch = token.match(/^([1-5])\s+(.+)$/);
  if (arabicMatch) {
    return `${arabicToRoman[arabicMatch[1]]} ${arabicMatch[2]}`;
  }

  return token;
}

function buildBookAliasMap(books) {
  const aliasToCanonical = new Map();

  for (const book of books) {
    const canonical = normalizeBookToken(book);
    const aliases = new Set([canonical, swapLeadingNumberStyle(canonical)]);

    for (const alias of aliases) {
      const existing = aliasToCanonical.get(alias);
      if (existing && existing !== book) {
        throw new Error(`Book alias collision between "${existing}" and "${book}" (${alias})`);
      }
      aliasToCanonical.set(alias, book);
    }
  }

  return aliasToCanonical;
}

function canonicalBookFor(token, aliasToCanonical) {
  const normalized = normalizeBookToken(decodeURIComponent(String(token ?? "")));
  return aliasToCanonical.get(normalized) ?? aliasToCanonical.get(swapLeadingNumberStyle(normalized)) ?? null;
}

function validateNotesAgainstBooks(noteEntries, books) {
  const aliasToCanonical = buildBookAliasMap(books);
  const errors = [];

  for (const { fileName, data } of noteEntries) {
    const baseName = fileName.replace(/\.json$/i, "");
    const fileNameMatch = baseName.match(/^(.*)-(\d+)$/);
    if (!fileNameMatch) {
      errors.push(`notes/${fileName}: filename must be "<book>-<chapter>.json"`);
      continue;
    }

    const fileBookToken = fileNameMatch[1];
    const fileBookCanonical = canonicalBookFor(fileBookToken, aliasToCanonical);
    if (!fileBookCanonical) {
      errors.push(`notes/${fileName}: book in filename "${fileBookToken}" is not in books.json`);
    }

    const dataBookCanonical = canonicalBookFor(data.book, aliasToCanonical);
    if (!dataBookCanonical) {
      errors.push(`notes/${fileName}: note.book "${data.book}" is not in books.json`);
    }

    if (fileBookCanonical && dataBookCanonical && fileBookCanonical !== dataBookCanonical) {
      errors.push(
        `notes/${fileName}: filename book "${fileBookCanonical}" does not match note.book "${data.book}"`
      );
    }

    const hrefMatches = String(data.text ?? "").matchAll(/href="([^"]+)"/g);
    for (const match of hrefMatches) {
      const href = match[1];
      if (!href.startsWith("#")) {
        continue;
      }

      const fragment = decodeURIComponent(href.slice(1));
      const bookInLink = fragment.split(":")[0];
      if (!canonicalBookFor(bookInLink, aliasToCanonical)) {
        errors.push(`notes/${fileName}: bible link "${href}" has unknown book "${bookInLink}"`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Book validation failed:\n- ${errors.join("\n- ")}`);
  }
}

function combineAiNotes({
  sourceFile = SOURCE_FILE,
  notesDir = NOTES_DIR,
  articlesDir = ARTICLES_DIR,
  metaFile = META_FILE,
  booksFile = BOOKS_FILE,
} = {}) {
  const html = fs.readFileSync(sourceFile, "utf8");
  const match = html.match(DATA_BLOCK_RE);
  if (!match) {
    throw new Error("Could not find DATA START/DATA END block in ai-notes.html");
  }

  const books = JSON.parse(fs.readFileSync(booksFile, "utf8"));
  const noteEntries = readJsonFiles(notesDir, { includeFileName: true });
  validateNotesAgainstBooks(noteEntries, books);

  const notes = noteEntries.map((entry) => entry.data);
  const articles = readJsonFiles(articlesDir);
  const savedAt = fs.existsSync(metaFile)
    ? JSON.parse(fs.readFileSync(metaFile, "utf8")).savedAt ?? null
    : null;

  const data = {
    notes,
    articles,
    savedAt,
  };

  const endIndentMatch = match[3].match(/\n([ \t]*)\/\/ ========= DATA END =========/);
  const endIndent = endIndentMatch ? endIndentMatch[1] : "      ";
  const replacement = `${match[1]}${JSON.stringify(data, null, 2)}\n${endIndent}// ========= DATA END =========`;
  const updatedHtml = html.replace(DATA_BLOCK_RE, replacement);
  fs.writeFileSync(sourceFile, updatedHtml, "utf8");

  return { notesCount: notes.length, articlesCount: articles.length };
}

function main() {
  const { notesCount, articlesCount } = combineAiNotes();
  console.log(`Combine complete: wrote ${notesCount} note(s) and ${articlesCount} article(s).`);
}

if (require.main === module) {
  main();
}

module.exports = {
  combineAiNotes,
};
