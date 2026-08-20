# Editor Component - Refactored Architecture

## Overview

The Editor component is a comprehensive rich text editor with support for text formatting, lists, headings, links (including Bible bookmarks), images with resizing/alignment, tables, and source code editing. It has been refactored from a single 1432-line file into a modular architecture for better maintainability and code organization.

## File Structure

```
Editor/
├── Editor.tsx                 # Main component (refactored, now ~600 lines with extensive comments)
├── types.ts                   # TypeScript type definitions
├── utils.ts                   # General utility functions (HTML, images, DOM)
├── selectionUtils.ts          # Text selection and undo/redo management
├── formattingUtils.ts         # Content formatting operations
├── imageUtils.ts              # Image handling and resizing
├── linkUtils.ts               # Link and Bible bookmark operations
├── tableUtils.ts              # Table manipulation utilities
├── toolbarConfig.ts           # Toolbar button configuration
├── dialogs.tsx                # Dialog sub-components
├── menus.tsx                  # Context menu sub-components
├── Editor.css                 # Styles
├── README.md                  # This file
└── [other assets]
```

## Module Descriptions

### `types.ts` (~70 lines)
**Purpose:** Centralized TypeScript type definitions

**Key Types:**
- `EditorProps` - Component props (value, lastFileSyncDate, onChange)
- `LinkMenuState` - Context menu state for links
- `ImageMenuState` - Context menu state for images
- `ResizeOverlayState` - Image resize handle overlay state
- `ActiveResizeState` - Active image resizing state
- `ToolbarButton` - Toolbar button configuration
- `BibleBookmarkSelection` - Bible reference data

**When to modify:** Add new types when adding features or state

---

### `utils.ts` (~160 lines)
**Purpose:** General utility functions for HTML handling, image processing, and DOM manipulation

**Key Functions:**
- `escapeHtml()` - Prevents XSS attacks by escaping HTML
- `getBibleBooks()` - Retrieves Bible book list from window global
- `parseBibleBookmarkHash()` - Parses Bible reference URLs (e.g., "#Genesis:3")
- `createBibleBookmarkHtml()` - Generates Bible link HTML
- `canOpenLinkHref()` - Validates link URLs for security
- `readFileAsDataUrl()` - Converts files to base64 data URLs
- `loadImage()` - Loads images from Blob with object URL cleanup
- `compressToWebPSmall()` - Compresses images to WebP (max 1200px)
- `findParentTag()` - Traverses DOM tree to find parent element

**When to modify:** Add utility functions that don't fit other modules

---

### `selectionUtils.ts` (~110 lines)
**Purpose:** Text selection and undo/redo functionality

**Key Functions:**
- `withSelectedNode()` - Performs operations on selected text
- `replaceElementUndoably()` - Replaces DOM elements with undo support
- `replaceNodeWithTextUndoably()` - Replaces nodes with text
- `removeNodeUndoably()` - Removes nodes with undo support

**Key Concepts:**
- Uses `document.execCommand()` for undo/redo support
- Falls back to direct DOM manipulation if execCommand fails
- Uses unique tokens to find replaced elements

**When to modify:** When changing how undo/redo or selection works

---

### `formattingUtils.ts` (~110 lines)
**Purpose:** Text and block formatting operations

**Key Functions:**
- `runExec()` - Executes document commands with editor focusing
- `runFormatBlock()` - Applies block-level formatting (h1-h3, p, etc.)
- `applyAlertVariant()` - Applies alert styling (info, warning, error)
- `insertHtmlAtSelection()` - Inserts HTML at cursor position
- `getColorForHighlight()` - Maps color names to CSS colors
- `createHighlightBadgeHtml()` - Generates verse highlight badge HTML

**When to modify:** When adding new text formatting features

---

### `imageUtils.ts` (~180 lines)
**Purpose:** Image handling, resizing, and alignment

**Key Functions:**
- `updateResizeOverlayFromImage()` - Positions resize handle overlay
- `setImageLayoutStyles()` - Applies size classes (small/medium/full)
- `setImageAlignmentStyles()` - Applies alignment (left/center/right)
- `applyImageLayout()` - Applies both layout and alignment
- `applyImageAlignment()` - Applies only alignment
- `removeImage()` - Deletes image from editor
- `insertImages()` - Inserts multiple images with compression

**Key Concepts:**
- Image sizing: small (33%), medium (66%), full (100%)
- Three alignment modes with specific margin/float rules
- Automatic image compression to WebP format

**When to modify:** When changing image handling behavior

---

### `linkUtils.ts` (~140 lines)
**Purpose:** Link and Bible bookmark operations

**Key Functions:**
- `submitLink()` - Creates or updates a regular link
- `removeLink()` - Removes a link element
- `openLink()` - Opens link safely in browser
- `submitBibleBookmark()` - Creates or updates Bible reference link

**Security Features:**
- Validates URLs before opening (prevents javascript: protocols)
- Escapes HTML in URLs and text
- Adds rel="noopener noreferrer" for external links

**When to modify:** When changing link/bookmark behavior

---

### `tableUtils.ts` (~140 lines)
**Purpose:** Table creation and manipulation

**Key Functions:**
- `withCurrentCell()` - Helper to perform actions on current cell
- `insertTable()` - Creates 2x2 table at selection
- `addTableRow()` - Inserts row after current row
- `deleteTableRow()` - Removes current row
- `addTableColumn()` - Inserts column after current column
- `deleteTableColumn()` - Removes current column
- `deleteTable()` - Removes entire table

**When to modify:** When adding table features

---

### `toolbarConfig.ts` (~75 lines)
**Purpose:** Toolbar button configuration and definitions

**Key Function:**
- `buildToolbarButtons()` - Returns organized button configuration

**Button Groups:**
- **Top:** Undo, Redo
- **Formatting:** Bold, Italic, Underline, Strikethrough, Lists, Indents

**When to modify:** When adding/removing toolbar buttons

---

### `dialogs.tsx` (~210 lines)
**Purpose:** Dialog sub-components for user input

**Components:**
- `LinkDialog` - Insert/edit regular link
- `BibleDialog` - Insert/edit Bible bookmark
- `HighlightDialog` - Select verse for highlight badge

**Design:**
- Modal overlay with click-outside-to-close
- Organized input fields with clear labels
- Conditional rendering based on `show` prop

**When to modify:** When changing dialog layout or behavior

---

### `menus.tsx` (~150 lines)
**Purpose:** Context menu sub-components

**Components:**
- `LinkContextMenu` - Right-click menu for links (Open, Edit, Remove)
- `ImageContextMenu` - Right-click menu for images (Layout, Alignment, Delete)
- `ImageResizeOverlay` - Resize handle overlay for images

**When to modify:** When adding context menu options

---

### `Editor.tsx` (~600 lines with comments)
**Purpose:** Main component orchestrating all functionality

**Structure:**
```
STATE MANAGEMENT         - Define all React state
REFS                     - Persistent references across renders
BIBLE CONTEXT            - Bible highlights integration
CORE CONTENT MANAGEMENT  - emitContent, syncFromEditor
SELECTION MANAGEMENT     - saveSelection, restoreSelection
WRAPPER FUNCTIONS        - Bind utilities to component state
EFFECTS                  - Setup and cleanup
LINK OPERATIONS          - Link insertion, editing, removal
BIBLE BOOKMARKS          - Bible link operations
IMAGE OPERATIONS         - Image insertion, resizing, alignment
TABLE OPERATIONS         - Table creation and manipulation
TEXT FORMATTING          - Heading/block style changes
TOOLBAR BUTTONS          - Build toolbar configuration
RENDER                   - JSX structure
```

**Key Improvements:**
- ~1000 lines reduced to ~600 with extensive comments
- Clear section separation with visual markers
- Extensive comments explaining each section and complex logic
- Consistent function naming conventions

---

## Usage Example

```tsx
import Editor from "./Editor";

function MyComponent() {
  const [content, setContent] = useState("");

  return (
    <Editor
      value={content}
      onChange={(html) => setContent(html)}
    />
  );
}
```

---

## Adding New Features

### Adding a new toolbar button:

1. Add button configuration to `buildToolbarButtons()` in `toolbarConfig.ts`
2. Create utility function in appropriate module (or create new module)
3. Add handler in `Editor.tsx` in the appropriate section
4. Call handler in the button's onClick

### Adding a new dialog:

1. Create dialog component in `dialogs.tsx`
2. Add state for dialog visibility and form fields in `Editor.tsx`
3. Add dialog rendering in the RENDER section
4. Create submission handler

### Adding a new image operation:

1. Add utility function to `imageUtils.ts`
2. Create menu button in `ImageContextMenu` in `menus.tsx`
3. Add handler in `Editor.tsx` IMAGE OPERATIONS section
4. Connect menu button to handler

---

## Testing

Key areas to test after modifications:

1. **Selection Management:**
   - Text selection is saved and restored
   - Undo/redo works correctly

2. **Link Operations:**
   - Links can be inserted, edited, removed
   - Bible bookmarks parse and insert correctly
   - Security validation prevents malicious URLs

3. **Image Operations:**
   - Images compress and resize
   - Alignment and layout apply correctly
   - Resize handle works smoothly

4. **Table Operations:**
   - Tables can be created and manipulated
   - Row/column operations work correctly
   - Table deletion works

5. **Source Mode:**
   - HTML source can be edited
   - Changes apply correctly when switching back

---

## Performance Considerations

1. **Image Compression:** Uses canvas to compress images to WebP format
2. **Resize Overlay:** Updated efficiently on scroll/resize events
3. **Verse Badges:** Updates only when highlights actually change
4. **Content Sync:** Avoids redundant updates by comparing content

---

## Accessibility

- All buttons have proper `title` and `aria-label` attributes
- Semantic HTML structure
- Keyboard support for all operations
- Dialog modals with focus management

---

## CSS Classes

See `Editor.css` for styling. Key classes:

- `.custom-editor` - Main container
- `.editor-toolbar` - Toolbar container
- `.editor-content` - Editable content area
- `.editor-floating-menu` - Context menus
- `.editor-modal-overlay` - Dialog overlay
- `.editor-image` - Images in editor
- `.editor-highlight-badge` - Verse badges

---

## Browser Compatibility

Requires modern browser with support for:
- `contentEditable`
- `document.execCommand()`
- `FileReader` API
- Canvas API
- CSS Grid
