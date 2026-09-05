## Components

This is a Bible notes web app built with React 19 and Material UI v9. Users can read Bible chapters, take notes (per book/chapter), write free-form articles, and annotate verses with colour highlights. All content is persisted as a single local JSON file via the browser File System Access API.

---

### Architecture overview

```
App
└── BibleProvider          (single global context, wraps everything)
    └── MainTab            (tab bar + tab panels)
        ├── HomeTab        (home panel – bookshelf, navigation, note list)
        └── MainTabBox     (bible + study layout for non-home tabs)
            ├── BibleText  (renders the selected chapter)
            └── StudyPanel
                ├── NotesAndEditorPanel  (rich-text note editor)
                └── RefPanel             (cross-reference viewer)
```

---

### Global state – `BibleContext`

**File:** `src/contexts/BibleContext.tsx`

The single React context (`BibleContextType`) that all components consume. Key fields:

| Field | Type | Purpose |
|---|---|---|
| `tabs` | `TabState[]` | All open tabs |
| `currentTab` | `number` | Index of the active tab |
| `books` | `string[]` | Bible book names (loaded from API) |
| `notes` | `NoteEntry[]` | Per-chapter notes (including highlights) |
| `articles` | `ArticleEntry[]` | Free-form articles keyed by `#id` |
| `bibleText` | `any \| null` | Parsed JSON from the selected translation |
| `lastFileSyncDate` | `Date \| undefined` | Truthy when a notes file is loaded; gates save/edit UI |
| `editorOpen` | `boolean` | Whether the rich-text editor is visible |

Highlights are stored inside `NoteEntry.highlights: HighlightData[]` and managed by `setHighlight`, `removeHighlight`, `getHighlights`.

---

### TabState modes

```ts
type TabMode = 'home' | 'bible' | 'article';
```

- **`home`** – Shows `HomeTab` (no `selectedBook`/`articleId`).
- **`bible`** – Shows `MainTabBox` with `BibleText` + `StudyPanel`. Requires `selectedBook` + `chapterNumber`.
- **`article`** – Shows `MainTabBox` (StudyPanel only). Requires `articleId` (e.g. `#grace`).

---

### Component descriptions

#### `MainTab` — `src/components/MainTab/MainTab.tsx`
Tab bar manager. Renders one MUI `<Tab>` per `tabs` entry plus a "+ New Tab" tab (hidden at `MAX_TAB_LIMIT`). Each tab shows a close button. Dispatches to `HomeTab` (mode = "home") or `MainTabBox` (mode = "bible"/"article") via `CustomTabPanel`.

**Key behaviour:** Clicking the + tab calls `addTab()`; close buttons call `closeTab(i)`. Tab labels are derived from `TabState` (`selectedBook + chapterNumber`, `articleId`, or "Home").

---

#### `MainTabBox` — `src/components/MainTab/MainTabBox.tsx`
Responsive grid layout for non-home tabs. Renders `BibleText` (only in bible mode) and `StudyPanel` side-by-side on medium+ screens.

---

#### `HomeTab` — `src/components/Tabs/HomeTab.tsx`
Landing page with three sections:
1. **Bookshelf** – visual book-spine buttons grouped by canon section (Law, History, Gospels, etc.). Clicking a spine opens that book at chapter 1 in the current tab.
2. **Bible + chapter selector** – `Autocomplete` + chapter `TextField` + Open button; lists existing notes for quick re-opening.
3. **Article panel** – create/open free-form articles by `#id` hashtag.

Also renders `SaveOpen` for file I/O.

---

#### `BibleText` — `src/components/BiblePanel/BibleText.tsx`
Displays a single Bible chapter. States: no-book, loading, unavailable, book-not-found, chapter-not-found, and the full verse list. On mouse-up over a verse, opens `HighlighterMenu` anchored to that verse element. Highlighted verses receive a colour background from `getHighlights()`. Scrolls to `verseNumber` via a `ref` on mount/update.

---

#### `BookActions` — `src/components/BiblePanel/BookActions.tsx`
A compact toolbar (book `Autocomplete` + chapter/verse `TextField`s + Open button) that lives inside `BibleText`'s card header. Calls `updateTab(currentTab, { selectedBook, chapterNumber, verseNumber })` and stacks vertically on mobile.

⚠️ MUI Autocomplete renders a popup-indicator button with `aria-label="Open"`. When querying for the chapter navigation "Open" button in tests, use `screen.getByText('Open')` rather than `getByRole('button', { name: /open/i })` to avoid ambiguity.

---

#### `StudyPanel` — `src/components/StudyPanel/StudyPanel.tsx`
Thin wrapper `<Card>` that composes `NotesAndEditorPanel` and `RefPanel`.

---

#### `NotesAndEditorPanel` — `src/components/StudyPanel/NotesPanel/NotesAndEditorPanel.tsx`
Manages note/article editing UI:
- **No notes file loaded** (`!lastFileSyncDate`): shows "New File" prompt.
- **Home mode**: shows "Select an option from Home to get started."
- **Bible/article mode**: shows the current note as rendered HTML (read-only) **or** the `Editor` component (when `editorOpen`). Toggle via "Open Editor" / "Close Editor" buttons.

Auto-opens the editor when `lastFileSyncDate` is set and `currentNoteText` is empty (new note).

---

#### `RefPanel` — `src/components/ReferencePanel/RefPanel.tsx`
Loads `./public/Refdata/cross_references_from.json`, `cross_references_to.json`, and `books.json` only when the Bible panel is active. Both cross-reference files are keyed by book/chapter/verse (not a flat array), so the panel reads only the current chapter's data directly (`data[book][chapter]`) instead of scanning the whole dataset. Displays two MUI `List`s:
- **Linked from** this chapter — references this chapter points to elsewhere (`cross_references_from.json`).
- **Linking to** this chapter — other references that cite the current chapter (`cross_references_to.json`).

Each entry is a clickable `<Link href="#BookName:chapter:verse">` that navigates via URL hash routing. Preview text for each reference is taken from the loaded `bibleText`.

Only active in `bible` mode; shows a placeholder otherwise.

---

#### `SaveOpen` — `src/components/ActionBar/SaveOpen.tsx`
Two-button row: **Load** (calls `loadNotesFromFile`) and either **New File** or **Save** depending on `lastFileSyncDate`. Used in `HomeTab` and `NotesAndEditorPanel`.

---

#### `HighlighterMenu` — `src/components/Highlighter/HighlighterMenu.tsx`
MUI `<Menu>` with 5 colour options (green/blue/pink/orange/purple) and a "Remove highlight" item. Opened by `BibleText` on verse text selection. Exported alongside `HIGHLIGHT_COLORS` constant.

---

#### `HighlightBadge` — `src/components/Highlighter/HighlightBadge.tsx`
Renders a coloured indicator for a highlighted verse. Two variants:
- `editable={true}` (default) — MUI `<Chip>` with a delete icon; calls `onDelete` when deleted.
- `editable={false}` — plain coloured `<Box>` showing the verse number only.

---

### Key utilities

| File | Purpose |
|---|---|
| `src/contexts/BibleContextUtils.ts` | Tab management helpers (`addTab`, `closeTab`, `updateTab`, `parseHash`, `MAX_TAB_LIMIT = 6`) |
| `src/contexts/notesUtils.ts` | Immutable helpers for `notes`/`articles`/`highlights` state updates |
| `src/contexts/notesFileIO.ts` | File System Access API wrappers for save/load JSON |
| `src/contexts/bibleTextLoader.ts` | `fetchBibleText()` — fetches translation JSON; exports `BIBLE_TRANSLATIONS` and `DEFAULT_BIBLE_TRANSLATION` (`'cpdv'`) |
| `src/components/utils/BibleUtils.ts` | `BOOK_GROUPS`, `normalizeBookAlias`, cross-reference helpers |
| `src/components/Editor/` | Rich-text editor and its utility modules |

---

### Testing notes

- Test files live in `src/__tests__/` (utilities) and `src/__tests__/components/` (React components).
- Tests use Jest + `ts-jest` + `@testing-library/react`.
- Use `renderWithContext` from `src/__tests__/components/testUtils.tsx` to wrap components with a mock `BibleContext.Provider`.
- MUI uses CSS-in-JS (Emotion); do **not** assert `element.style.backgroundColor` for `sx`-prop colours — those styles are injected as CSS classes, not inline styles.
- The MUI Autocomplete popup indicator has `aria-label="Open"`. When querying for the chapter navigation "Open" button, use `screen.getByText('Open')` to avoid multiple-match errors.
- MUI Chip delete icon: use `container.querySelector('.MuiChip-deleteIcon')` + `fireEvent.click()` rather than `userEvent.click()`.
