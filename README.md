# Bible Notes Application

https://ozkey.github.io/notes/

A React-based Bible notes application that allows users to read Bible text, highlight verses, and create rich notes with integrated verse references.

## Features

- **Bible Text Display**: Browse and read Bible passages with verse numbers
- **Highlighting System**: Highlight verses in 6 different colors (green, blue, pink, red, orange, purple)
- **Rich Text Editor**: Create formatted notes with support for:
  - Text formatting (bold, italic, underline, strikethrough)
  - Lists and indentation
  - Links and Bible references
  - Tables and images
  - Alert/quote blocks
- **Verse Badge Insertion**: Insert highlighted or plain verse references as interactive badges in notes
- **Persistent Storage**: All notes and highlights are automatically saved

## Project Structure

```
notes/
├── packages/
│   ├── ui/          # React frontend application
│   └── api/         # Backend API (if applicable)
├── package.json
└── README.md
```

## Prerequisites

- Node.js (v16 or higher)
- Yarn package manager (v4.15.0+)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd notes
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Navigate to the UI package**
   ```bash
   cd packages/ui
   ```

## Development

### Start Development Server
```bash
yarn start
```
This runs webpack dev server on `http://localhost:8080`

### Build for Production
```bash
yarn build
```

### Watch Mode Development
```bash
yarn dev
```

### Format Code
```bash
yarn prettier
```

## How to Use

### Reading Bible Text
1. Select a book and chapter from the left panel
2. Browse the Bible text displayed with verse numbers

### Highlighting Verses
1. Select text in any verse
2. A highlight color menu appears
3. Choose your desired color
4. The verse background will be highlighted

### Creating Notes
1. Use the editor in the right panel to write notes
2. Use the toolbar buttons for formatting:
   - **B/I/U**: Bold, Italic, Underline
   - **Link**: Add hyperlinks
   - **Bible Link**: Link to a specific Bible chapter
   - **Highlighter**: Insert highlighted or plain verse references
   - **Image**: Add images
   - **Table**: Insert tables

### Inserting Verse Badges
1. Click the **Highlighter** button in the editor toolbar
2. A grid of all verses in the current chapter appears
3. Click on any verse to insert it as a badge:
   - **Highlighted verses**: Insert with their highlight color
   - **Non-highlighted verses**: Insert with white background
4. The verse number appears as a non-editable badge in your note

## Technologies Used

- **React 19.2**: UI library
- **TypeScript**: Type-safe JavaScript
- **Material-UI 9.0**: Component library
- **Webpack 5**: Module bundler
- **Yarn**: Package manager

## License

© 2026 Bible Notes Application