const fs = require("node:fs");
const path = require("node:path");

const AI_DIR = path.resolve(__dirname, "..", "src", "public", "notes", "ai");
const SOURCE_FILE = path.join(AI_DIR, "ai-notes.html");
const NOTES_DIR = path.join(AI_DIR, "notes");
const ARTICLES_DIR = path.join(AI_DIR, "articles");
const META_FILE = path.join(AI_DIR, "data-meta.json");

const DATA_BLOCK_RE =
  /(\/\/ ========= DATA START =========\s*)([\s\S]*?)(\s*\/\/ ========= DATA END =========)/;

function readJsonFiles(dirPath) {
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
      return JSON.parse(content);
    });
}

function combineAiNotes({
  sourceFile = SOURCE_FILE,
  notesDir = NOTES_DIR,
  articlesDir = ARTICLES_DIR,
  metaFile = META_FILE,
} = {}) {
  const html = fs.readFileSync(sourceFile, "utf8");
  const match = html.match(DATA_BLOCK_RE);
  if (!match) {
    throw new Error("Could not find DATA START/DATA END block in ai-notes.html");
  }

  const notes = readJsonFiles(notesDir);
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
