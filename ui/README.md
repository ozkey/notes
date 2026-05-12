# notes
# Notes App

A simple React application with a header, footer, and 3-column layout featuring cards.

## Tech Stack

- **React** - UI library
- **Webpack** - Module bundler
- **Material-UI (MUI)** - UI component library
- **TypeScript** - Type-safe JavaScript

## Features

- Header with title
- 3-column responsive grid layout with cards
- Footer
- Responsive design (adapts to different screen sizes)
- Card hover animations

## Installation

```bash
npm install
```

## Development

To start the development server on `http://localhost:3000`:

```bash
npm start
```

The server will automatically reload when you make changes.

## Build

To create a production build:

```bash
npm run build
```

The output will be in the `dist/` folder.

## Project Structure

```
src/
  ├── index.html      # HTML template
  ├── index.tsx       # React entry point
  └── App.tsx         # Main App component
package.json          # Dependencies and scripts
tsconfig.json         # TypeScript configuration
webpack.config.mjs    # Webpack configuration
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run dev` - Build in watch mode

create a simple react app that has one page a header and a footer. 3 cols and in each col a card with a simple title like col1 col2 col3.
I want you to use webpack, react, mui, typescript.