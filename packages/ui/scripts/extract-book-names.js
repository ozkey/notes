const fs = require("node:fs");
const path = require("node:path");

const SOURCE_FILE = path.resolve(
  __dirname,
  "..",
  "src",
  "public",
  "Catholic-Public-Domain-Version.json",
);
const OUTPUT_FILE = path.resolve(
  __dirname,
  "..",
  "src",
  "public",
  "notes",
  "ai",
  "books.json",
);

function extractBookNames({
  sourceFile = SOURCE_FILE,
  outputFile = OUTPUT_FILE,
} = {}) {
  const json = JSON.parse(fs.readFileSync(sourceFile, "utf8"));
  const books = Array.isArray(json.books) ? json.books : [];

  const names = books
    .map((book) =>
      book && typeof book.name === "string" ? book.name.trim() : "",
    )
    .filter(Boolean);

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(names, null, 2)}\n`, "utf8");

  return names.length;
}

function main() {
  const count = extractBookNames();
  console.log(`Wrote ${count} book name(s) to ${OUTPUT_FILE}`);
}

if (require.main === module) {
  main();
}

module.exports = {
  extractBookNames,
};
