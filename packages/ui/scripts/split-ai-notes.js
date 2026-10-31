const fs = require("node:fs");
const path = require("node:path");

const AI_DIR = path.resolve(__dirname, "..", "src", "public", "notes", "ai");
const SOURCE_FILE = path.join(AI_DIR, "ai-notes.html");
const NOTES_DIR = path.join(AI_DIR, "notes");
const ARTICLES_DIR = path.join(AI_DIR, "articles");
const META_FILE = path.join(AI_DIR, "data-meta.json");

const DATA_BLOCK_RE =
  /(\/\/ ========= DATA START =========\s*)([\s\S]*?)(\s*\/\/ ========= DATA END =========)/;

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getUniqueFileName(dirPath, baseName) {
  let fileName = `${baseName}.json`;
  let counter = 2;
  while (fs.existsSync(path.join(dirPath, fileName))) {
    fileName = `${baseName}-${counter}.json`;
    counter += 1;
  }
  return fileName;
}

function clearJsonFiles(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    return;
  }

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".json")) {
      fs.unlinkSync(path.join(dirPath, entry.name));
    }
  }
}

function readDataFromHtml(filePath) {
  const html = fs.readFileSync(filePath, "utf8");
  const match = html.match(DATA_BLOCK_RE);
  if (!match) {
    throw new Error("Could not find DATA START/DATA END block in ai-notes.html");
  }

  const dataJson = match[2].trim().replace(/;$/, "");
  const data = JSON.parse(dataJson);
  return data;
}

function splitAiNotes({
  sourceFile = SOURCE_FILE,
  notesDir = NOTES_DIR,
  articlesDir = ARTICLES_DIR,
  metaFile = META_FILE,
} = {}) {
  const data = readDataFromHtml(sourceFile);
  const notes = Array.isArray(data.notes) ? data.notes : [];
  const articles = Array.isArray(data.articles) ? data.articles : [];

  clearJsonFiles(notesDir);
  clearJsonFiles(articlesDir);

  notes.forEach((note) => {
    const bookSlug = slugify(note.book || "note");
    const chapter = note.chapterNumber ?? "unknown";
    const fileName = getUniqueFileName(notesDir, `${bookSlug}-${chapter}`);
    fs.writeFileSync(path.join(notesDir, fileName), `${JSON.stringify(note, null, 2)}\n`, "utf8");
  });

  articles.forEach((article) => {
    const articleId = String(article.id || "article").replace(/^#/, "");
    const fileName = getUniqueFileName(articlesDir, slugify(articleId || "article"));
    fs.writeFileSync(
      path.join(articlesDir, fileName),
      `${JSON.stringify(article, null, 2)}\n`,
      "utf8",
    );
  });

  const meta = {
    savedAt: data.savedAt ?? null,
  };
  fs.writeFileSync(metaFile, `${JSON.stringify(meta, null, 2)}\n`, "utf8");

  return { notesCount: notes.length, articlesCount: articles.length };
}

function main() {
  const { notesCount, articlesCount } = splitAiNotes();
  console.log(`Split complete: ${notesCount} note file(s), ${articlesCount} article file(s).`);
}

if (require.main === module) {
  main();
}

module.exports = {
  splitAiNotes,
  slugify,
};
