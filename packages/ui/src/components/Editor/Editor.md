# Editor requirements

The editor components is a WYSIWYG editor built with React and TypeScript.
It is designed to provide a rich text editing experience with support for various formatting options, media embedding, and built-in editor actions.

### Features

- Rich text formatting (bold, italic, underline, strikethrough)
- Headings (H1, H2, H3, etc.)
- Lists (ordered and unordered)
- indentation and outdentation
- Blockquotes (default, informational, warning, and error alerts)
- Tables (allow for resize, addition, deletion, and modification of rows and columns)
- Code blocks with syntax highlighting
- Image embedding
  - images can be dropped into the editor and encoded as base64
  - images can be resized and aligned using a simple UI (drag to resize)
- links (internal and external)
- Bible links (using hash links to reference specific book and chapter in the Bible)
  - the editor shows a built-in modal so user can select the book and chapter, and then generate the appropriate hash link
  - when user clicks on a Bible link a menu should come up to allow editing or navigating to the referenced book and chapter
- redo and undo

## other requirements

- it should work on mobile and desktop devices
- build completely in React and TypeScript

## Buttons

buttons (using traditional icons) should be ordered as follows:

- undo, redo,
- headings (dropdown: H1, H2, H3, p, quote , info, warning, error),
- bold, italic, underline, strikethrough,
- lists (ordered, unordered),
- indentation, outdentation,

next row

- links
- Bible link
- image
- tables
- view/edit source (to view the HTML source of the content)
