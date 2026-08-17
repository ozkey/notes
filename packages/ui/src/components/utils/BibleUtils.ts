const ORDINAL_TO_ROMAN: Record<string, string> = {
  "1": "I",
  "2": "II",
  "3": "III",
};
const ROMAN_TO_ORDINAL: Record<string, string> = { I: "1", II: "2", III: "3" };

export const toRomanOrdinalBook = (book: string) =>
  book.replace(/^([1-3])\s+(.+)$/, (_, ordinal: string, name: string) => {
    return `${ORDINAL_TO_ROMAN[ordinal]} ${name}`;
  });

export const toArabicOrdinalBook = (book: string) =>
  book.replace(/^(III|II|I)\s+(.+)$/, (_, roman: string, name: string) => {
    return `${ROMAN_TO_ORDINAL[roman]} ${name}`;
  });

export const formatBookLabel = (book: string) => {
  return toRomanOrdinalBook(book);
};

export const BOOK_GROUPS: Array<{ title: string; books: string[] }> = [
  {
    title: "Law",
    books: ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy"],
  },
  {
    title: "History",
    books: [
      "Joshua",
      "Judges",
      "Ruth",
      "I Samuel",
      "II Samuel",
      "I Kings",
      "II Kings",
      "I Chronicles",
      "II Chronicles",
      "Ezra",
      "Nehemiah",
      "Esther",
    ],
  },
  {
    title: "Poetry",
    books: ["Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon"],
  },
  {
    title: "Major Prophets",
    books: ["Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel"],
  },
  {
    title: "Minor Prophets",
    books: [
      "Hosea",
      "Joel",
      "Amos",
      "Obadiah",
      "Jonah",
      "Micah",
      "Nahum",
      "Habakkuk",
      "Zephaniah",
      "Haggai",
      "Zechariah",
      "Malachi",
    ],
  },
  { title: "Gospels", books: ["Matthew", "Mark", "Luke", "John"] },
  { title: "History (NT)", books: ["Acts"] },
  {
    title: "Paul Letters",
    books: [
      "Romans",
      "I Corinthians",
      "II Corinthians",
      "Galatians",
      "Ephesians",
      "Philippians",
      "Colossians",
      "I Thessalonians",
      "II Thessalonians",
      "I Timothy",
      "II Timothy",
      "Titus",
      "Philemon",
    ],
  },
  {
    title: "General Letters",
    books: [
      "Hebrews",
      "James",
      "I Peter",
      "II Peter",
      "I John",
      "II John",
      "III John",
      "Jude",
    ],
  },
  { title: "Prophecy", books: ["Revelation of John"] },
];
