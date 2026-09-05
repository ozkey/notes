const fs = require("fs");
const path = require("path");

function resolveOutputDirectory(outputArg, inputFile) {
  if (!outputArg) {
    return path.dirname(path.resolve(inputFile)) || ".";
  }

  if (path.extname(outputArg) === ".json") {
    return path.dirname(path.resolve(outputArg));
  }

  return path.resolve(outputArg);
}

function parseReference(ref) {
  const normalized = String(ref || "").trim();
  if (!normalized) {
    return null;
  }

  const match = normalized.match(/^(.+?)\.(\d+)\.(\d+)/);
  if (!match) {
    return null;
  }

  const [, book, chapter, verse] = match;
  return {
    book: book.trim(),
    chapter: Number(chapter),
    verse: Number(verse),
  };
}

function ensureReferenceList(target, book, chapter, verse) {
  if (!target[book]) {
    target[book] = {};
  }
  if (!target[book][String(chapter)]) {
    target[book][String(chapter)] = {};
  }
  if (!target[book][String(chapter)][String(verse)]) {
    target[book][String(chapter)][String(verse)] = [];
  }
  return target[book][String(chapter)][String(verse)];
}

function referenceKey(ref) {
  return [ref.book, ref.chapter, ref.verse].join(".");
}

const inputFile = process.argv[2] || "cross_references.txt";
const outputArg = process.argv[3];
const outputDir = resolveOutputDirectory(outputArg, inputFile);
const outputToFile = path.join(outputDir, "cross_references_to.json");
const outputFromFile = path.join(outputDir, "cross_references_from.json");
const booksFile = path.join(outputDir, "books.json");

try {
  const data = fs.readFileSync(inputFile, "utf8");
  const lines = data.split(/\r?\n/);
  const referencesTo = {};
  const referencesFrom = {};
  const books = new Set();

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const parts = line.split("\t");
    if (parts.length < 3) continue;

    const fromRef = parts[0].trim();
    const toRef = parts[1].trim();
    const score = Number.parseInt(parts[2].trim(), 10);

    if (!Number.isInteger(score) || score < 1) continue;

    const from = parseReference(fromRef);
    const to = parseReference(toRef);
    if (!from || !to) continue;

    books.add(from.book);
    books.add(to.book);

    // cross_references_from.json is keyed by the *source* verse and lists the
    // verses it references (outgoing links).
    const outgoingEntry = {
      to: referenceKey(to),
      score,
    };
    ensureReferenceList(referencesFrom, from.book, from.chapter, from.verse).push(outgoingEntry);

    // cross_references_to.json is keyed by the *target* verse and lists the
    // verses that reference it (incoming links), so each entry must record
    // the originating ("from") reference rather than repeating the key.
    const incomingEntry = {
      to: referenceKey(from),
      score,
    };
    ensureReferenceList(referencesTo, to.book, to.chapter, to.verse).push(incomingEntry);
  }

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputToFile, JSON.stringify(referencesTo, null, 2));
  fs.writeFileSync(outputFromFile, JSON.stringify(referencesFrom, null, 2));
  fs.writeFileSync(booksFile, JSON.stringify([...books].sort(), null, 2));

  console.log(
    `✓ Converted ${Object.keys(referencesTo).length} keyed verse targets and ${Object.keys(referencesFrom).length} keyed verse sources to ${outputToFile} and ${outputFromFile}`
  );
} catch (error) {
  console.error("Error:", error.message);
  process.exit(1);
}
