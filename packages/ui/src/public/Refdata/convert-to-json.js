const fs = require("fs");
const path = require("path");

// Read input file
const inputFile = process.argv[2] || "cross_references.txt";
const outputFile = process.argv[3] || "cross_references.json";
const booksFile = path.join(path.dirname(outputFile), "books.json");

try {
  const data = fs.readFileSync(inputFile, "utf8");
  const lines = data.trim().split("\n");

  // Skip header row and parse data
  const result = [];
  const books = new Set();
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split("\t");
    if (parts.length >= 3) {
      const from = parts[0].trim();
      const to = parts[1].trim();
      const votes = parseInt(parts[2].trim(), 10);

      const fromBook = from.split(".")[0].trim();
      const toBook = to.split(".")[0].trim();
      if (fromBook) books.add(fromBook);
      if (toBook) books.add(toBook);

      if (Number.isNaN(votes) || votes < 1) continue;

      result.push({ from, to, votes });
    }
  }

  // Write to JSON file
  fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
  fs.writeFileSync(booksFile, JSON.stringify([...books].sort(), null, 2));
  console.log(
    `✓ Converted ${result.length} rows to ${outputFile} and ${books.size} books to ${booksFile}`
  );
} catch (error) {
  console.error("Error:", error.message);
  process.exit(1);
}
