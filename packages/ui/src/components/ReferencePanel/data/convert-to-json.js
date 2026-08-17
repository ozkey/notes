const fs = require("fs");
const path = require("path");

// Read input file
const inputFile = process.argv[2] || "cross_references.txt";
const outputFile = process.argv[3] || "cross_references.json";

try {
  const data = fs.readFileSync(inputFile, "utf8");
  const lines = data.trim().split("\n");

  // Skip header row and parse data
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split("\t");
    if (parts.length >= 3) {
      result.push({
        from: parts[0].trim(),
        to: parts[1].trim(),
        votes: parseInt(parts[2].trim(), 10),
      });
    }
  }

  // Write to JSON file
  fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
  console.log(`✓ Converted ${result.length} rows to ${outputFile}`);
} catch (error) {
  console.error("Error:", error.message);
  process.exit(1);
}
