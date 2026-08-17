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

export type BookAliases = [string, ...string[]];
export type BookGroup = { title: string; books: BookAliases[] };

export const BOOK_GROUPS: BookGroup[] = [
  {
    title: "Law",
    books: [
      ["Genesis", "Gen", "Ge", "Gn"],
      ["Exodus", "Exod", "Ex"],
      ["Leviticus", "Lev", "Le"],
      ["Numbers", "Num", "Nm"],
      ["Deuteronomy", "Deut", "Dt"],
    ],
  },
  {
    title: "History",
    books: [
      ["Joshua", "Josh", "Jos"],
      ["Judges", "Judg", "Jdg"],
      ["Ruth", "Rth"],
      ["I Samuel", "1 Samuel", "1 Sam"],
      ["II Samuel", "2 Samuel", "2 Sam"],
      ["I Kings", "1 Kings", "1 Kgs"],
      ["II Kings", "2 Kings", "2 Kgs"],
      ["I Chronicles", "1 Chronicles", "1 Chr"],
      ["II Chronicles", "2 Chronicles", "2 Chr"],
      ["Ezra", "Ezr"],
      ["Nehemiah", "Neh"],
      ["Tobit", "Tob"],
      ["Judith", "Jdt"],
      ["Esther", "Est"],
      ["I Maccabees", "1 Maccabees", "1 Macc", "1 Mc"],
      ["II Maccabees", "2 Maccabees", "2 Macc", "2 Mc"],
    ],
  },
  {
    title: "Poetry",
    books: [
      ["Job", "Jb"],
      ["Psalms", "Psalm", "Ps"],
      ["Proverbs", "Prov", "Prv"],
      ["Ecclesiastes", "Eccl", "Ecc"],
      ["Song of Solomon", "Song of Songs", "Canticles", "Song"],
      ["Wisdom", "Wisdom of Solomon", "Wis"],
      ["Sirach", "Ecclesiasticus", "Sir"],
    ],
  },
  {
    title: "Major Prophets",
    books: [
      ["Isaiah", "Isa"],
      ["Jeremiah", "Jer"],
      ["Lamentations", "Lam"],
      ["Baruch", "Bar"],
      ["Ezekiel", "Ezek", "Eze"],
      ["Daniel", "Dan", "Dn"],
      ["Prayer of Azariah", "Azariah"],
      ["Susanna"],
      ["Bel and the Dragon", "Bel & the Dragon", "Bel"],
      ["Letter of Jeremiah"],
    ],
  },
  {
    title: "Minor Prophets",
    books: [
      ["Hosea", "Hos"],
      ["Joel", "Jl"],
      ["Amos", "Am"],
      ["Obadiah", "Obad", "Ob"],
      ["Jonah", "Jon"],
      ["Micah", "Mic"],
      ["Nahum", "Nah"],
      ["Habakkuk", "Hab"],
      ["Zephaniah", "Zeph", "Zep"],
      ["Haggai", "Hag"],
      ["Zechariah", "Zech", "Zec"],
      ["Malachi", "Mal"],
    ],
  },
  {
    title: "Gospels",
    books: [
      ["Matthew", "Matt", "Mt"],
      ["Mark", "Mk", "Mrk"],
      ["Luke", "Lk", "Luk"],
      ["John", "Jn", "Jhn"],
    ],
  },
  { title: "History (NT)", books: [["Acts", "Act", "Ac"]] },
  {
    title: "Paul Letters",
    books: [
      ["Romans", "Rom", "Rm"],
      ["I Corinthians", "1 Corinthians", "1 Cor"],
      ["II Corinthians", "2 Corinthians", "2 Cor"],
      ["Galatians", "Gal"],
      ["Ephesians", "Eph"],
      ["Philippians", "Phil", "Php"],
      ["Colossians", "Col"],
      ["I Thessalonians", "1 Thessalonians", "1 Thess", "1 Thes"],
      ["II Thessalonians", "2 Thessalonians", "2 Thess", "2 Thes"],
      ["I Timothy", "1 Timothy", "1 Tim"],
      ["II Timothy", "2 Timothy", "2 Tim"],
      ["Titus", "Tit"],
      ["Philemon", "Phlm", "Phm"],
    ],
  },
  {
    title: "General Letters",
    books: [
      ["Hebrews", "Heb"],
      ["James", "Jas", "Jm"],
      ["I Peter", "1 Peter", "1 Pet"],
      ["II Peter", "2 Peter", "2 Pet"],
      ["I John", "1 John", "1 Jn"],
      ["II John", "2 John", "2 Jn"],
      ["III John", "3 John", "3 Jn"],
      ["Jude", "Jud"],
    ],
  },
  {
    title: "Prophecy",
    books: [["Revelation of John", "Revelation", "Apocalypse", "Rev"]],
  },
];
